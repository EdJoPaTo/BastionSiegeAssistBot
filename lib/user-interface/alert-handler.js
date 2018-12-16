const {createAlertAtTimestamp} = require('../javascript-abstraction/alert')

const {emoji} = require('../input/game-text')

const ALERT_TYPES = {
  nextBattle: 'Next Battle available'
}

const alertEmojis = {
  disabled: '🔕',
  enabled: '🔔',
  nextBattle: emoji.army
}

class AlertHandler {
  constructor(telegram) {
    this.telegram = telegram
    this.alertsOfUsers = {}
  }

  generateUpcomingEventsList(gameInformation = {}) {
    const eventList = []

    const {battleSoloTimestamp, battleAllianceTimestamp} = gameInformation
    const lastAttackTimestamp = Math.max(battleSoloTimestamp || 0, battleAllianceTimestamp || 0)
    eventList.push({
      type: 'nextBattle',
      timestamp: lastAttackTimestamp + (60 * 10),
      text: 'You can attack again. I wish you luck. ☺️'
    })
    eventList.push({
      type: 'nextBattle',
      timestamp: battleAllianceTimestamp + (60 * 59),
      text: 'Your next alliance attack is available in 1 min. Get ready and spread the hype! 🥳😎'
    })

    return eventList
  }

  recreateAlerts(user, enabledAlerts = [], gameInformation) {
    const oldAlerts = this.alertsOfUsers[user] || []
    oldAlerts.forEach(o => {
      clearTimeout(o)
    })

    this.alertsOfUsers[user] = []

    const eventList = this.generateUpcomingEventsList(gameInformation)
      .filter(o => enabledAlerts.indexOf(o.type) >= 0)

    eventList.forEach(event => {
      const message = alertEmojis.enabled + alertEmojis[event.type] + event.text
      this.createAndAddAlert(user, event.timestamp, message)
    })
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

module.exports = Object.assign(AlertHandler, {
  alertEmojis,
  ALERT_TYPES
})
