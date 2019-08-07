const Telegraf = require('telegraf')

const {whenScreenContainsInformation} = require('../lib/input/gamescreen')

const bot = new Telegraf.Composer()

bot.on('text', whenScreenContainsInformation('effects', ctx => {
  return ctx.reply(ctx.i18n.t('effects.updated'))
}))

module.exports = {
  bot
}
