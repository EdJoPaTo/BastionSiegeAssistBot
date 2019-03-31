const Telegraf = require('telegraf')

const playerHistory = require('../lib/data/player-history')

const {isForwardedFromBastionSiege} = require('../lib/input/bastion-siege-bot')
const {detectGamescreen, getScreenInformation} = require('../lib/input/gamescreen')

const bot = new Telegraf.Composer()

// Init User session
bot.use((ctx, next) => {
  if (!ctx.session.gameInformation) {
    ctx.session.gameInformation = {}
  }

  return next()
})

function forwardedFromClone(ctx) {
  return ctx && ctx.message && ctx.message.forward_from && ctx.message.forward_from.id === 741981483
}

bot.on('text', Telegraf.optional(forwardedFromClone, ctx => {
  return ctx.reply('🙃')
}))

// Load game screen type and information
bot.on('text', Telegraf.optional(isForwardedFromBastionSiege, (ctx, next) => {
  const {text, forward_date: timestamp} = ctx.message
  const ingameTimestamp = Math.floor(timestamp / 60) * 60
  ctx.state.screen = {
    ...detectGamescreen(text),
    timestamp,
    ingameTimestamp
  }

  try {
    ctx.state.screen.information = getScreenInformation(text)
  } catch (error) {
    console.error('could not get screen information', ctx.state.screen, text, error)
    ctx.state.screen.information = {}
  }

  if (Object.keys(ctx.state.screen.information).length === 0) {
    if (process.env.NODE_ENV !== 'production') {
      console.log('newInformation is empty')
    }
  }

  return next()
}))

const WANTED_DATA = [
  'attackscout',
  'buildings',
  'domainStats',
  'effects',
  'player',
  'resources',
  'workshop'
]

// Save some gameInformation to session or ignore when already known
bot.on('text', Telegraf.optional(isForwardedFromBastionSiege, (ctx, next) => {
  const newInformation = ctx.state.screen.information
  const {timestamp} = ctx.state.screen

  const dataAvailable = WANTED_DATA
    .filter(o => newInformation[o])
  if (dataAvailable.length === 0) {
    return next()
  }

  const newData = dataAvailable
    .filter(data => (ctx.session.gameInformation[data + 'Timestamp'] || 0) < timestamp)
  if (newData.length === 0) {
    return ctx.reply(ctx.i18n.t('forward.known'))
  }

  for (const data of newData) {
    ctx.session.gameInformation[data + 'Timestamp'] = timestamp
    ctx.session.gameInformation[data] = newInformation[data]
    playerHistory.add(ctx.from.id, data, timestamp, newInformation[data])
  }

  return next()
}))

module.exports = {
  bot
}
