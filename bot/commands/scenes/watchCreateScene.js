import tg from 'telegraf'
import WizardScene from 'telegraf/scenes/wizard/index.js'
import {
  URL
} from 'url'
import axios from 'axios'

import jq from 'node-jq'
import util from 'util'

util.promisify(jq.run)

const {
  Composer,
  Markup
} = tg

const stringAsValidUrl = (s) => {
  try {
    const url = new URL(s);
    return url.href;
  } catch (err) {
    console.log('err', err)
    return false;
  }
};

const stepHandler = new Composer()
stepHandler.action('next', async (ctx) => {
  await ctx.reply('Skip condition')

  ctx.wizard.next();
  return ctx.wizard.steps[ctx.wizard.cursor](ctx);
})
stepHandler.on('message', async (ctx) => {
  const condition = ctx.message.text
  ctx.scene.session.task.condition = condition
  await ctx.reply('Condition added')

  ctx.wizard.next();
  return ctx.wizard.steps[ctx.wizard.cursor](ctx);
})

const watchCreate = new WizardScene('watchCreate',
  (ctx) => {
    ctx.reply('Enter watch uri:')

    ctx.scene.session.task = {}
    ctx.scene.session.task.userId = ctx.message.from.id

    return ctx.wizard.next()
  },
  (ctx) => {
    const uri = stringAsValidUrl(ctx.message.text)
    if (!uri) {
      return ctx.reply('Invalid uri. Try again.')
    }
    ctx.scene.session.task.uri = uri

    ctx.reply('Enter jq path:')
    return ctx.wizard.next()
  },
  async (ctx) => {
      const filter = ctx.message.text
      try {
        await ctx.reply('Perform check...')
        const result = await axios.get(ctx.scene.session.task.uri)
        if (result.status !== 200) {
          console.log(result)
          return ctx.reply('Error loading data from uri. Try anoter one.')
        }

        const filtered = await jq.run(filter, result.data, {
          input: 'json'
        })
        if (filtered === null) {
          return ctx.reply('Filtered value is null. Try another filter.')
        }

        await ctx.replyWithMarkdown('Filtered value: ' + filtered)
      } catch (e) {
        await ctx.reply(e.message)
        return ctx.reply('Error filtering by jq. Try another expression or /cancel')
      }
      ctx.scene.session.task.filter = filter

      ctx.reply('Enter condition:', Markup.inlineKeyboard([
        Markup.callbackButton('➡️ Without condition', 'next')
      ]).extra())
      return ctx.wizard.next()
    },
    stepHandler,
    async (ctx) => {
      

      ctx.reply('Done')
      return ctx.scene.leave()
    }
)

export default watchCreate