import axios from 'axios'
import sendToTelegramUser from './tools/sendToTelegramUser.js'
import client from '../misc/redisClientInit.js'

export default async () => {
  console.log('checkYanex %s', (new Date()).toISOString())
  const subsrCount = await client.scard('yandex')
  if (subsrCount === 0) {
    return
  }

  const transactions = await axios.post('https://money.yandex.ru/api/operation-history', 'records=5', {
    headers: {
      Authorization: `Bearer ${process.env.YANDEX_TOKEN}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  })
  if (transactions.status !== 200) {
    console.log(transactions)
    return
  }

  const newTransactions = []
  for (const transaction of transactions.data.operations.reverse()) {
    if (transaction.direction !== 'in') {
      continue
    }

    const isTransactionProcessed = await client.sismember('transYandex', transaction.operation_id)
    if (isTransactionProcessed) {
      continue
    }

    const newTransaction = {
      date: transaction.datetime,
      amount: transaction.amount,
      comment: transaction.title
    }
    newTransactions.push(newTransaction)
    client.sadd('transYandex', transaction.operation_id)
  }
  console.log('end checkYanex %s', (new Date()).toISOString())

  if (newTransactions.length === 0) {
    return
  }

  console.log('New Yoomoney transactions found: ', newTransactions)

  const subscr = await client.smembers('yandex')
  subscr.forEach(userId => sendToTelegramUser(userId, newTransactions))
}
