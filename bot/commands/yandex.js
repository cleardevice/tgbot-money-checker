import client from '../misc/redisClientInit.js'

const allowedMembers = process.env.TG_ID_ALLOWED.split(',').map(x => Number.parseInt(x))

export default ctx => {
  const userId = ctx.message.from.id
  if (!allowedMembers.includes(userId)) {
    return
  }

  client.sadd('yandex', userId)

  console.log('UserId: %d subscribed to Yandex', userId)
  ctx.reply('Subscribed to Yandex')
}
