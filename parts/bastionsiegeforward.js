const Telegraf = require('telegraf')

const { Extra, Markup } = Telegraf

const bot = new Telegraf.Composer()
module.exports = bot

bot.on('text', ctx => {
  return ctx.reply('test!!1!')
})
