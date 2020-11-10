import client from '../misc/redisClientInit.js'

const allowedMembers = process.env.TG_ID_ALLOWED.split(',').map(x => Number.parseInt(x))

export default ctx => {
  const userId = ctx.message.from.id
  if (!allowedMembers.includes(userId)) {
    return
  }

  client.sadd('qiwi', userId)

  console.log('UserId: %d subscribed to Qiwi', userId)
  ctx.reply('Subscribed to Qiwi')
}
