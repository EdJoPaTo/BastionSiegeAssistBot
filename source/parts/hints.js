const Telegraf = require('telegraf')

const poweruser = require('../lib/data/poweruser')

const {emoji} = require('../lib/user-interface/output-text')
const {getHintStrings} = require('../lib/user-interface/poweruser')

const POWERUSER_HINT_PREFIX = emoji.poweruser
const HINTS_MAX_INTERVAL = 60 * 30 // 30 Minutes

const bot = new Telegraf.Composer()

bot.on('text', async (ctx, next) => {
  const now = Date.now() / 1000
  if (ctx.session.lastHintTimestamp + HINTS_MAX_INTERVAL > now) {
    return next()
  }

  let poweruserHints = []
  if (poweruser.hasSendEnoughReports(ctx.from.id)) {
    const conditions = poweruser.getConditions(ctx.from.id)
    poweruserHints = getHintStrings(ctx, conditions)
  }

  const hints = [
    ...poweruserHints.map(o => POWERUSER_HINT_PREFIX + o)
  ]
  if (hints.length > 0) {
    ctx.session.lastHintTimestamp = now
    await ctx.replyWithMarkdown(hints.join('\n\n'))
  }

  return next()
})

module.exports = {
  bot
}
