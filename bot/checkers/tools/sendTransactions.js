import mustache from 'mustache-formats'
import sendToTelegram from './sendToTelegramUser.js'

const template = `<i>{{date|date:"DD.MM.YYYY HH:mm"}}:</i>{{#from}}\nfrom: {{from}}{{/from}}
<b>{{amount}} rub</b>{{#comment}} comment: "{{comment}}"{{/comment}}`

export default (userId, transactions) => {
  transactions.forEach(transaction => {
    sendToTelegram(userId, mustache.render(template, transaction), {
      parse_mode: 'HTML'
    })
  })
}
