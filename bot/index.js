import './config.js'
import './checkers/index.js'
import bot from './misc/telegrafClient.js'

import {
  qiwi,
  yandex,
  unsubscribe
} from './commands/index.js'

bot.start(ctx => ctx.reply('Hello stranger... 🕸'))
bot.command('qiwi', qiwi)
bot.command('yandex', yandex)
bot.command('un', unsubscribe)

bot.command('watch', (ctx) => ctx.scene.enter('watchCreate'))
bot.on('message', (ctx) => ctx.reply('Try /watch'))

bot.launch()
