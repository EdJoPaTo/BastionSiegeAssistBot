const Telegraf = require('telegraf')
const stringify = require('json-stable-stringify')

const userSessions = require('../lib/data/user-sessions')

const AlertHandler = require('../lib/user-interface/alert-handler')

const bot = new Telegraf.Composer()
let alertHandler

function start(telegram) {
  alertHandler = new AlertHandler(telegram)
  userSessions.getRaw()
    .forEach(({user, data}) => {
      const {alerts, gameInformation} = data
      alertHandler.recreateAlerts(user, alerts, gameInformation)
    })
}

bot.use(async (ctx, next) => {
  const before = getCompareableString(ctx)
  await next()
  const after = getCompareableString(ctx)

  if (before !== after) {
    alertHandler.recreateAlerts(ctx.from.id, ctx.session.alerts, ctx.session.gameInformation)
  }
})

function getCompareableString(ctx) {
  const {alerts, gameInformation} = ctx.session
  return stringify({
    alerts,
    gameInformation
  })
}

module.exports = {
  bot,
  start
}
