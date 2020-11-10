require('dotenv').config()
const async = require('async')

const template = `<i>{{date|date:"DD.MM.YYYY HH:mm"}}:</i>{{#from}}\nfrom: {{from}}{{/from}}
<b>{{amount}} rub</b>{{#comment}} comment: "{{comment}}"{{/comment}}`

const mustache = require('mustache-formats')
const axios = require('axios')
const asyncRedis = require("async-redis")
const client = asyncRedis.createClient({
    db: 0,
    host: process.env.TELEGRAM_SESSION_HOST || '127.0.0.1',
    port: process.env.TELEGRAM_SESSION_PORT || 6379
});

client.on("error", function(error) {
    console.error(error);
});

const {Telegraf} = require('telegraf')
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

const sendToTelegramUser = (userId, transactions) => {
    transactions.forEach(transaction => {
        bot.telegram.sendMessage(userId, mustache.render(template, transaction), { parse_mode:'HTML' })
            .catch(console.error)
    })
}

const checkQiwi = async () => {
    console.log('checkQiwi %s', (new Date()).toISOString())
    const subsrCount = await client.scard('qiwi')
    if (subsrCount == 0)
        return

    const transactions = await axios.get('https://edge.qiwi.com/payment-history/v2/persons/380981510050/payments?operation=IN&sources=QW_RUB&rows=5', {
        headers: {
            Authorization: `Bearer ${process.env.QIWI_TOKEN}`
        }
    })
    if (transactions.status != 200) {
        console.log(transactions)
        return
    }

    const newTransactions = []
    for (const transaction of transactions.data.data.reverse()) {
        const isTransactionProcessed = await client.sismember('transQiwi', transaction['txnId'])
        if (isTransactionProcessed)
            continue

        const newTransaction = {
            date: transaction['date'],
            amount: transaction['total']['amount'],
            comment: transaction['comment'],
            from: transaction['account']
        }
        newTransactions.push(newTransaction)
        client.sadd('transQiwi', transaction['txnId'])
    }
    console.log('end checkQiwi %s', (new Date()).toISOString())

    if (newTransactions.length == 0)
        return

    console.log('New Qiwi transactions found: ', newTransactions)

    const subscr = await client.smembers('qiwi')
    subscr.forEach(userId => sendToTelegramUser(userId, newTransactions))
}

const checkYanex = async () => {
    console.log('checkYanex %s', (new Date()).toISOString())
    const subsrCount = await client.scard('yandex')
    if (subsrCount == 0)
        return

    const transactions = await axios.post('https://money.yandex.ru/api/operation-history', 'records=5', {
        headers: {
            Authorization: `Bearer ${process.env.YANDEX_TOKEN}`,
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    })
    if (transactions.status != 200) {
        console.log(transactions)
        return
    }

    const newTransactions = []
    for (const transaction of transactions.data.operations.reverse()) {
        if (transaction['direction'] != 'in')
            continue

        const isTransactionProcessed = await client.sismember('transYandex', transaction['operation_id'])
        if (isTransactionProcessed)
            continue

        const newTransaction = {
            date: transaction['datetime'],
            amount: transaction['amount'],
            comment: transaction['title']
        }
        newTransactions.push(newTransaction)
        client.sadd('transYandex', transaction['operation_id'])
    }
    console.log('end checkYanex %s', (new Date()).toISOString())

    if (newTransactions.length == 0)
        return

    console.log('New Yoomoney transactions found: ', newTransactions)

    const subscr = await client.smembers('yandex')
    subscr.forEach(userId => sendToTelegramUser(userId, newTransactions))
}

const checksToPerform = [checkQiwi, checkYanex]
setInterval(() => {
    async.parallel(checksToPerform)
}, 60*1000)

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