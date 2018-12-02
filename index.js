const fs = require('fs')
const LocalSession = require('telegraf-session-local')
const Telegraf = require('telegraf')

const battlereportsDataFix = require('./lib/battlereports-data-fix')

const bastionsiegeforward = require('./parts/bastionsiegeforward')
const inlineQuery = require('./parts/inline-query')

const partBattleStats = require('./parts/battlestats')
const partBotStats = require('./parts/bot-stats')
const partBuildings = require('./parts/buildings')
const partPlayerStats = require('./parts/playerstats')
const partSearch = require('./parts/search')

const {Extra, Markup} = Telegraf

const tokenFilePath = process.env.NODE_ENV === 'production' ? process.env.npm_package_config_tokenpath : process.env.npm_package_config_tokenpathdebug
const token = fs.readFileSync(tokenFilePath, 'utf8').trim()
const bot = new Telegraf(token)

battlereportsDataFix.findAndFixBadBattlereports()

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

// Fix previous bot problems
bot.use((ctx, next) => {
  if (ctx.session.gameInformation) {
    delete ctx.session.gameInformation.battlereport
  }
  return next()
})

bot.use(bastionsiegeforward.bot)
bot.use(inlineQuery.bot)

bot.use(partBattleStats.bot)
bot.use(partBotStats.bot)
bot.use(partBuildings.bot)
bot.use(partPlayerStats.bot)
bot.use(partSearch.bot)

bot.on('text', (ctx, next) => {
  if (!ctx.message.forward_from && ctx.chat.id === ctx.from.id &&
    (ctx.message.text.indexOf('Battles observed') >= 0 ||
    ctx.message.text.indexOf('🛡💙 This player is an active user of this bot.') >= 0)
  ) {
    // Thats an inline query. Ignore :)
    return
  }
  return next()
})

bot.use(ctx => {
  let text = `Hey ${ctx.from.first_name}!\n`

  text += '\nYou should forward ingame screens from @BastionSiegeBot to me.'

  text += '\n'
  text += '\nWith forwarded screens that contain your current buildings or resources I can predict when upgrades are ready.'

  text += '\n'
  text += '\nWith battle reports I can show your history in battles.'
  text += ' Forwarding the "Your scouts found" message shows information about that player like possible loot and required army.'
  text += ' See more about the search at /search.'

  text += '\n'
  text += '\nBattlereports you provide will only be used to assume the enemies strength.'
  text += ' Your own data known to me will not be considered to tell others your strength.'
  text += ' It gets even better: As long as you are actively providing data to me you will get immunity and no one can use me to check on you.'

  text += '\n'
  text += '\nYou have an idea or found a bug? Join @BastionSiegeAssist and share it. Let us make this bot even better :)'

  const keyboard = Markup.inlineKeyboard([
    Markup.switchToCurrentChatButton('try player search…', 'Dragon')
  ])
  return ctx.replyWithMarkdown(text, Extra.markup(keyboard))
})

bot.catch(error => {
  console.error('Telegraf Error', error.response || error)
})

bot.startPolling()
