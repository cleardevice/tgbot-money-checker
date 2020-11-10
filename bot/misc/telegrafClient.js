import tg from 'telegraf'

const {
  Telegraf
} = tg

const bot = new Telegraf(process.env.BOT_TOKEN)
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
