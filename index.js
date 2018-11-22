const fs = require('fs')
const LocalSession = require('telegraf-session-local')
const Telegraf = require('telegraf')

const bastionsiegeforward = require('./parts/bastionsiegeforward')
const inlineQuery = require('./parts/inline-query')

const tokenFilePath = process.env.NODE_ENV === 'production' ? process.env.npm_package_config_tokenpath : process.env.npm_package_config_tokenpathdebug
const token = fs.readFileSync(tokenFilePath, 'utf8').trim()
const bot = new Telegraf(token)

// For handling group/supergroup commands (/start@your_bot) you need to provide bot username.
bot.telegram.getMe().then(botInfo => {
  bot.options.username = botInfo.username
})

const localSession = new LocalSession({
  // Database name/path, where sessions will be located (default: 'sessions.json')
  database: 'persist/sessions.json',
  // Format of storage/database (default: JSON.stringify / JSON.parse)
  format: {
    serialize: obj => JSON.stringify(obj, null, 2),
    deserialize: str => JSON.parse(str)
  }
})
bot.use(localSession.middleware())

bot.use(bastionsiegeforward)
bot.use(inlineQuery.bot)

bot.use(ctx => ctx.reply('just forward me ingame screens like the building screen or a screen with your current resources'))

bot.catch(error => {
  console.error('Telegraf Error', error.response || error)
})

bot.startPolling()
