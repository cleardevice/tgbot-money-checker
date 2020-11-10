import axios from 'axios'
import sendTransactions from './tools/sendTransactions.js'
import client from '../misc/redisClientInit.js'

export default async () => {
  console.log('checkQiwi %s', (new Date()).toISOString())
  const subsrCount = await client.scard('qiwi')
  if (subsrCount === 0) {
    return
  }

  const transactions = await axios.get('https://edge.qiwi.com/payment-history/v2/persons/380981510050/payments?operation=IN&sources=QW_RUB&rows=5', {
    headers: {
      Authorization: `Bearer ${process.env.QIWI_TOKEN}`
    }
  })
  if (transactions.status !== 200) {
    console.log(transactions)
    return
  }

  const newTransactions = []
  for (const transaction of transactions.data.data.reverse()) {
    const isTransactionProcessed = await client.sismember('transQiwi', transaction.txnId)
    if (isTransactionProcessed) {
      continue
    }

    const newTransaction = {
      date: transaction.date,
      amount: transaction.total.amount,
      comment: transaction.comment,
      from: transaction.account
    }
    newTransactions.push(newTransaction)
    client.sadd('transQiwi', transaction.txnId)
  }
  console.log('end checkQiwi %s', (new Date()).toISOString())

  if (newTransactions.length === 0) {
    return
  }

  console.log('New Qiwi transactions found: ', newTransactions)

  const subscr = await client.smembers('qiwi')
  subscr.forEach(userId => sendTransactions(userId, newTransactions))
}
