const Telegraf = require('telegraf')

const poweruser = require('../lib/data/poweruser')

const {emoji} = require('../lib/user-interface/output-text')

const POWERUSER_HINT_PREFIX = `⚠️${emoji.poweruser} `

const bot = new Telegraf.Composer()

bot.on('text', async (ctx, next) => {
  const poweruserHints = []
  if (poweruser.hasSendEnoughReports(ctx.from.id)) {
    if (!ctx.session.gameInformation.player) {
      poweruserHints.push(ctx.i18n.t('poweruser.nameRequired'))
    }
  }

  const hints = [
    ...poweruserHints.map(o => POWERUSER_HINT_PREFIX + o)
  ]
  if (hints.length > 0) {
    await ctx.replyWithMarkdown(hints.join('\n\n'))
  }

  return next()
})

module.exports = {
  bot
}
