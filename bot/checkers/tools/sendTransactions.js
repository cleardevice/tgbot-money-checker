import mustache from 'mustache-formats'
import sendToTelegram from './sendToTelegramUser.js'

const template = `<i>{{date|date:"DD.MM.YYYY HH:mm"}}:</i> <b>{{provider}}</b>{{#from}}\nfrom: {{from}}{{/from}}
<b>{{amount}} rub</b>{{#comment}} comment: "{{comment}}"{{/comment}}`

export default (userId, provider, transactions) => {
  transactions.forEach(transaction => {
    transaction.provider = provider
    sendToTelegram(userId, mustache.render(template, transaction), {
      parse_mode: 'HTML'
    })
  })
}
