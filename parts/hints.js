const Telegraf = require('telegraf')

const {getMidnightXDaysEarlier} = require('../lib/math/unix-timestamp')

const poweruser = require('../lib/data/poweruser')

const {emoji} = require('../lib/user-interface/output-text')

const POWERUSER_HINT_PREFIX = `⚠️${emoji.poweruser} `

const bot = new Telegraf.Composer()

bot.on('text', async (ctx, next) => {
  const poweruserHints = []
  const fiveDaysAgo = getMidnightXDaysEarlier(Date.now() / 1000, 5)
  const sevenDaysAgo = getMidnightXDaysEarlier(Date.now() / 1000, 7)

  if (poweruser.hasSendEnoughReports(ctx.from.id)) {
    if (!ctx.session.gameInformation.player) {
      poweruserHints.push(ctx.i18n.t('poweruser.nameRequired'))
    } else if (ctx.session.gameInformation.playerTimestamp < fiveDaysAgo) {
      let text = ctx.i18n.t('poweruser.nameOld')
      if (ctx.session.gameInformation.playerTimestamp > sevenDaysAgo) {
        text += '\n' + ctx.i18n.t('poweruser.nearlyOld')
      }

      poweruserHints.push(text)
    }

    if (ctx.session.gameInformation.buildingsTimestamp < fiveDaysAgo) {
      let text = ctx.i18n.t('poweruser.buildingsOld')
      if (ctx.session.gameInformation.buildingsTimestamp > sevenDaysAgo) {
        text += '\n' + ctx.i18n.t('poweruser.nearlyOld')
      }

      poweruserHints.push(text)
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
