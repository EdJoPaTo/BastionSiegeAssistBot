const Telegraf = require('telegraf')

const {isForwardedFromBastionSiege} = require('../lib/bastion-siege-bot')
const {detectgamescreen, getScreenInformation} = require('../lib/gamescreen')

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
  ctx.state.screen = {
    type: detectgamescreen(ctx.message.text),
    information: getScreenInformation(ctx.message.text),
    timestamp: ctx.message.forward_date
  }

  if (Object.keys(ctx.state.screen.information).length === 0) {
    if (process.env.NODE_ENV !== 'production') {
      console.log('newInformation is empty')
    }
    return next()
  }

  return next()
}))

module.exports = {
  bot
}
