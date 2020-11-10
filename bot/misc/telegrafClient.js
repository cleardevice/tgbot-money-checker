import tg from 'telegraf'
import watchCreateScene from '../commands/scenes/watchCreateScene.js'

const {
  Telegraf,
  session,
  Stage
} = tg

const bot = new Telegraf(process.env.BOT_TOKEN)
bot.use(session())

const stage = new Stage([watchCreateScene], {
  ttl: 60
})
stage.command('cancel', (ctx) => {
  ctx.reply("Operation canceled");
  return ctx.scene.leave();
});
bot.use(stage.middleware())

bot.use(async (ctx, next) => {
  const start = new Date()
  await next()
  const ms = new Date() - start

  const message = ctx.update.message || ctx.update.edited_message || ctx.update.callback_query.message
  if (message.from) {
    console.log('Interaction from userId: %s, response time: %sms', message.from.id, ms)
  }
  if (message.text) {
    console.log('Text: %s', message.text)
  }
})

export default bot