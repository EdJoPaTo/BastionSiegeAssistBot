const Telegraf = require('telegraf')

const { Extra, Markup } = Telegraf

const { detectgamescreen, getScreenInformation } = require('../lib/detectgamescreen')

const bot = new Telegraf.Composer()

bot.on('text', (ctx, next) => {
  if (!ctx.session.gameInformation) {
    ctx.session.gameInformation = {}
  }

  const newInformation = getScreenInformation(ctx.message.text)
  ctx.session.gameInformation = Object.assign(ctx.session.gameInformation, newInformation)
  return next()
})

bot.on('text', ctx => {
  console.log('bastion siege message')
  const screentype = detectgamescreen(ctx.message.text)
  const information = getScreenInformation(ctx.message.text)

  return ctx.reply(screentype + '\n' + JSON.stringify(ctx.session.gameInformation, null, '  '))
})

const abstraction = new Telegraf.Composer()
abstraction.use(Telegraf.optional(ctx => ctx && ctx.message && ctx.message.forward_from && ctx.message.forward_from.id === 252148344, bot))
module.exports = abstraction
