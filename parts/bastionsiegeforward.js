const Telegraf = require('telegraf')

const { Extra, Markup } = Telegraf

const { detectgamescreen } = require('../lib/detectgamescreen')

const bot = new Telegraf.Composer()

bot.on('text', ctx => {
  console.log('bastion siege message', ctx.message.text)
  return ctx.reply(detectgamescreen(ctx.message))
})

const abstraction = new Telegraf.Composer()
abstraction.use(Telegraf.optional(ctx => ctx && ctx.message && ctx.message.forward_from && ctx.message.forward_from.id === 252148344, bot))
module.exports = abstraction
