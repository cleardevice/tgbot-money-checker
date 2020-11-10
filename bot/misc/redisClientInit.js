import asyncRedis from 'async-redis'

const client = asyncRedis.createClient({
  db: 0,
  host: process.env.TELEGRAM_SESSION_HOST || '127.0.0.1',
  port: process.env.TELEGRAM_SESSION_PORT || 6379
})

client.on('error', function (error) {
  console.error(error)
})

export default client
