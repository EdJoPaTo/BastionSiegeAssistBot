const stringify = require('json-stable-stringify')

const {createAlertAtTimestamp} = require('../lib/alert')

const ALERT_TYPES = {
  nextBattle: 'Next Battle available'
}

class AlertHandler {
  constructor(telegram) {
    this.telegram = telegram
    this.alertsOfUsers = {}
  }

  middleware() {
    return async (ctx, next) => {
      const before = getCompareableString(ctx)
      await next()
      const after = getCompareableString(ctx)

      if (before !== after) {
        this.recreateAlerts(ctx.from.id, ctx.session.alerts, ctx.session.gameInformation)
      }
    }
  }

  recreateAlerts(user, alerts = [], gameInformation) {
    const oldAlerts = this.alertsOfUsers[user] || []
    oldAlerts.forEach(o => {
      clearTimeout(o)
    })

    this.alertsOfUsers[user] = []

    if (alerts.indexOf('nextBattle') >= 0) {
      const {battleSoloTimestamp, battleAllianceTimestamp} = gameInformation
      this.createAndAddAlert(user, battleSoloTimestamp + (60 * 10), '🔔⚔️ You can attack again. I wish you luck. ☺️')
      this.createAndAddAlert(user, battleAllianceTimestamp + (60 * 59), '🔔⚔️ Your next alliance attack is available in 1 min. Get ready and spread the hype! 🥳😎')
    }
  }

  createAndAddAlert(user, unixTimestamp, text) {
    const timestamp = unixTimestamp * 1000
    if (process.env.NODE_ENV !== 'production' && timestamp > Date.now()) {
      console.log('create alert at', new Date(timestamp), text)
    }
    const timeoutID = createAlertAtTimestamp(timestamp, () => this.telegram.sendMessage(user, text))
    if (timeoutID) {
      this.alertsOfUsers[user].push(timeoutID)
    }
  }
}

function getCompareableString(ctx) {
  const {alerts, gameInformation} = ctx.session
  return stringify({
    alerts,
    gameInformation
  })
}

module.exports = {
  ALERT_TYPES,
  AlertHandler
}
