const Telegraf = require('telegraf')

const {isForwardedFromBastionSiege} = require('../lib/input/bastion-siege-bot')
const {detectGamescreen, getScreenInformation} = require('../lib/input/gamescreen')

const bot = new Telegraf.Composer()

// Init User session
bot.use((ctx, next) => {
  if (!ctx.session.gameInformation) {
    ctx.session.gameInformation = {
      player: null,
      buildings: null,
      workshop: null,
      resources: null
    }
  }
  return next()
})

// Load game screen type and information
bot.on('text', Telegraf.optional(isForwardedFromBastionSiege, (ctx, next) => {
  const {text, forward_date: timestamp} = ctx.message
  ctx.state.screen = {
    ...detectGamescreen(text),
    timestamp
  }

  try {
    ctx.state.screen.information = getScreenInformation(text)
  } catch (error) {
    console.log('could not get screen information', ctx.state.screen, text, error)
    ctx.state.screen.information = {}
  }

  if (Object.keys(ctx.state.screen.information).length === 0) {
    if (process.env.NODE_ENV !== 'production') {
      console.log('newInformation is empty')
    }
  }

  return next()
}))

// Save some gameInformation to session or ignore when already known
bot.on('text', Telegraf.optional(isForwardedFromBastionSiege, (ctx, next) => {
  const newInformation = ctx.state.screen.information
  const {timestamp} = ctx.state.screen

  if (newInformation.buildings) {
    newInformation.buildingTimestamp = timestamp
    if (ctx.session.gameInformation.buildingTimestamp >= timestamp) {
      return ctx.reply('Thats not new to me. I will just ignore it.')
    }
  } else if (newInformation.resources) {
    newInformation.resourceTimestamp = timestamp
    if (ctx.session.gameInformation.resourceTimestamp >= timestamp) {
      return ctx.reply('Thats not new to me. I will just ignore it.')
    }
  } else if (newInformation.workshop) {
    newInformation.workshopTimestamp = timestamp
    if (ctx.session.gameInformation.workshopTimestamp >= timestamp) {
      return ctx.reply('Thats not new to me. I will just ignore it.')
    }
  }

  const addData = ['player', 'resources', 'buildings', 'workshop']
  addData.forEach(data => {
    if (newInformation[data]) {
      ctx.session.gameInformation[data] = newInformation[data]
    }
  })
  return next()
}))

module.exports = {
  bot
}
