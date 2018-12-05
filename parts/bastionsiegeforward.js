const Telegraf = require('telegraf')

const {isForwardedFromBastionSiege} = require('../lib/bastion-siege-bot')
const {detectGamescreen, getScreenInformation} = require('../lib/gamescreen')

const bot = new Telegraf.Composer()

// Init User session
bot.use((ctx, next) => {
  if (!ctx.session.gameInformation) {
    ctx.session.gameInformation = {
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

module.exports = {
  bot
}
