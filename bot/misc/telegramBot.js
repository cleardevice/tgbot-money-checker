import dotenv from 'dotenv'
import Telegraf from 'telegraf'

dotenv.config()
export default new Telegraf(process.env.BOT_TOKEN)
