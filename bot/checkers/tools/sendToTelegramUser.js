const template = `<i>{{date|date:"DD.MM.YYYY HH:mm"}}:</i>{{#from}}\nfrom: {{from}}{{/from}}
<b>{{amount}} rub</b>{{#comment}} comment: "{{comment}}"{{/comment}}`

import mustache from 'mustache-formats'

export default (userId, transactions) => {
    transactions.forEach(transaction => {
        bot.telegram.sendMessage(userId, mustache.render(template, transaction), { parse_mode:'HTML' })
            .catch(console.error)
    })
}
