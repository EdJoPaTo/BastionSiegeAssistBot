const Telegraf = require('telegraf')

const poweruser = require('../lib/data/poweruser')

const {emoji} = require('../lib/user-interface/output-text')

const bot = new Telegraf.Composer()

bot.on('text', async (ctx, next) => {
  if (!ctx.session.gameInformation.player &&
    poweruser.hasSendEnoughReports(ctx.from.id)) {
    const text = '\n⚠️' + emoji.poweruser + ' ' + ctx.i18n.t('poweruser.nameRequired')
    await ctx.replyWithMarkdown(text)
  }

  return next()
})

module.exports = {
  bot
}
