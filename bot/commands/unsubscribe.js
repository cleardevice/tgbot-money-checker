import client from '../misc/redisClientInit.js'

const allowedMembers = process.env.TG_ID_ALLOWED.split(',').map(x => Number.parseInt(x))

export default ctx => {
  const userId = ctx.message.from.id
  if (!allowedMembers.includes(userId)) {
    return
  }

  client.srem('qiwi', userId)
  client.srem('yandex', userId)

  console.log('UserId: %d unsubscribed', userId)
  ctx.reply('Unsubscribed')
}
