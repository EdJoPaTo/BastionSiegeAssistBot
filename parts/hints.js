const Telegraf = require('telegraf')

const poweruser = require('../lib/data/poweruser')

const {emoji} = require('../lib/user-interface/output-text')

const bot = new Telegraf.Composer()

bot.on('text', async (ctx, next) => {
  if (poweruser.hasSendEnoughReports(ctx.from.id) &&
    !ctx.session.gameInformation.player) {
    const text = '\n⚠️' + emoji.poweruser + ' ' + ctx.i18n.t('poweruser.nameRequired')
    await ctx.replyWithMarkdown(text)
  }

  return next()
})

module.exports = {
  bot
}
