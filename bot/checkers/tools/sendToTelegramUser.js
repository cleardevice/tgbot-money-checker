import bot from '../../misc/telegrafClient.js'

export default (userId, message, params) => {
  bot.telegram.sendMessage(userId, message, params)
    .catch(console.error)
}
