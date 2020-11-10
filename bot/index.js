import dotenv from 'dotenv'
dotenv.config()
import './checkers/index.js'

import client from './misc/redisClientInit.js'
import Telegraf from 'telegraf'
const bot = new Telegraf(process.env.BOT_TOKEN)

const allowedMembers = process.env.TG_ID_ALLOWED.split(',').map(x => Number.parseInt(x))
  
bot.use(async (ctx, next) => {
    const start = new Date()
    await next()
    const ms = new Date() - start

    const message = ctx.update['message'] || ctx.update['edited_message']
    console.log('Interaction from userId: %s, response time: %sms', message.from.id, ms)
    if (message['text'])
      console.log('Text: %s', message.text)
})

bot.start(ctx => ctx.reply('Hello stranger'))
bot.command('qiwi', ctx => {
    const userId = ctx.message.from.id
    if (!allowedMembers.includes(userId))
        return

    client.sadd('qiwi', userId)

    console.log('UserId: %d subscribed to Qiwi', userId)
    ctx.reply('Subscribed to Qiwi')
})
bot.command('yandex', ctx => {
    const userId = ctx.message.from.id
    if (!allowedMembers.includes(userId))
        return

    client.sadd('yandex', userId)

    console.log('UserId: %d subscribed to Yandex', userId)
    ctx.reply('Subscribed to Yandex')
})
bot.command('un', ctx => {
    const userId = ctx.message.from.id
    if (!allowedMembers.includes(userId))
        return

    client.srem('qiwi', userId)
    client.srem('yandex', userId)

    console.log('UserId: %d unsubscribed', userId)
    ctx.reply('Unsubscribed')
})

bot.launch()