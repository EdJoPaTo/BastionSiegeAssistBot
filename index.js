const fs = require('fs')
const Telegraf = require('telegraf')
const I18n = require('telegraf-i18n')

const userSessions = require('./lib/data/user-sessions')
const wars = require('./lib/data/wars')

const partAlerts = require('./parts/alerts')

const bastionsiegeforward = require('./parts/bastionsiegeforward')
const inlineQuery = require('./parts/inline-query')
const partHelp = require('./parts/help')
const partHints = require('./parts/hints')

const partAssumed = require('./parts/assumed')
const partBattlereport = require('./parts/battlereport')
const partBattleStats = require('./parts/battlestats')
const partBotStats = require('./parts/bot-stats')
const partBuildings = require('./parts/buildings')
const partCastleSiege = require('./parts/castle-siege')
const partEffects = require('./parts/effects')
const partPlayerStats = require('./parts/playerstats')
const partSettings = require('./parts/settings')
const partWar = require('./parts/war')

const {Extra, Markup} = Telegraf

const tokenFilePath = process.env.NODE_ENV === 'production' ? process.env.npm_package_config_tokenpath : process.env.npm_package_config_tokenpathdebug
const token = fs.readFileSync(tokenFilePath, 'utf8').trim()
const bot = new Telegraf(token)

// For handling group/supergroup commands (/start@your_bot) you need to provide bot username.
bot.telegram.getMe().then(botInfo => {
  bot.options.username = botInfo.username
})

if (process.env.NODE_ENV !== 'production') {
  bot.use(async (ctx, next) => {
    const identifier = [
      new Date().toISOString(),
      Number(ctx.update.update_id).toString(16),
      ctx.from && ctx.from.first_name,
      ctx.updateType
    ].join(' ')
    const callbackData = ctx.callbackQuery && ctx.callbackQuery.data
    const inlineQuery = ctx.inlineQuery && ctx.inlineQuery.query
    const messageText = ctx.message && ctx.message.text
    const data = callbackData || inlineQuery || messageText
    console.time(identifier)
    await next()
    if (data) {
      console.timeLog(identifier, data.length, data.replace(/\n/g, '\\n').substr(0, 50))
    } else {
      console.timeLog(identifier)
    }
  })
}

bot.use(async (ctx, next) => {
  try {
    await next()
  } catch (error) {
    if (error.message.includes('Too Many Requests')) {
      console.log('Telegraf Too Many Requests error. Skip.', error)
      return
    }

    console.log('try to send error to user', ctx.update, error)
    let text = '🔥 Something went wrong here!'
    text += '\n'
    text += 'You should join the Support Group and report this error. Let us make this bot even better together. ☺️'

    text += '\n'
    text += '\nError: `'
    text += error.message
      .replace(token, '')
    text += '`'

    const target = (ctx.chat || ctx.from).id
    const keyboard = Markup.inlineKeyboard([
      Markup.urlButton('Join BastionSiegeAssist Support Group', 'https://t.me/joinchat/AC0dV1dG2Y7sOFQPtZm9Dw')
    ], {columns: 1})
    return ctx.tg.sendMessage(target, text, Extra.markdown().markup(keyboard))
  }
})

bot.use(userSessions)
wars.init(bot.telegram)

// See https://yaml-multiline.info/ for multiline yaml stuff
const i18n = new I18n({
  directory: 'locales',
  defaultLanguage: 'en',
  defaultLanguageOnMissing: true,
  useSession: true
})

bot.use(i18n)

bot.use((ctx, next) => {
  const {username} = ctx.from || {}
  if (username) {
    ctx.session.__username = username
  } else {
    delete ctx.session.__username
  }

  return next()
})

// Fix previous bot problems
bot.use((ctx, next) => {
  if (ctx.session.gameInformation) {
    const allKeys = Object.keys(ctx.session.gameInformation)
    const keysWithValueNull = allKeys
      .filter(o => ctx.session.gameInformation[o] === null)

    keysWithValueNull
      .forEach(o => {
        delete ctx.session.gameInformation[o]
      })
  }

  delete ctx.session.battlestatsTimeframe
  delete ctx.session.battlestatsType
  delete ctx.session.language
  delete ctx.session.search

  return next()
})

partAlerts.start(bot.telegram)
bot.use(partAlerts.bot)

bot.use(bastionsiegeforward.bot)
bot.use(inlineQuery.bot)
bot.use(partHints.bot)

bot.use(partAssumed.bot)
bot.use(partBattlereport.bot)
bot.use(partBattleStats.bot)
bot.use(partBotStats.bot)
bot.use(partBuildings.bot)
bot.use(partCastleSiege.bot)
bot.use(partEffects.bot)
bot.use(partPlayerStats.bot)
bot.use(partSettings.bot)
bot.use(partWar.bot)

bot.use(partHelp.bot)

bot.catch(error => {
  console.error('Telegraf Error', error.response || error)
})

bot.startPolling()
