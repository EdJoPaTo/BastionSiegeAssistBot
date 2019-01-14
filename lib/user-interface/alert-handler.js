const {Extra, Markup} = require('telegraf')

const {createAlertAtTimestamp} = require('../javascript-abstraction/alert')

const {
  calcBuildingCost,
  calcGoldCapacity,
  calcMinutesNeeded,
  calcStorageCapacity
} = require('../math/siegemath')

const {emoji} = require('./output-text')
const {
  buildingNames,
  defaultBuildingsToShow
} = require('./buildings')

const alertEmojis = {
  disabled: '🔕',
  enabled: '🔔',
  buildingUpgrade: emoji.houses,
  effect: '✨',
  nextBattle: emoji.army
}

const ALERT_TYPES = {
  buildingUpgrade: alertEmojis.buildingUpgrade + ' Building Upgrade available',
  effect: alertEmojis.effect + ' Effect ended',
  nextBattle: alertEmojis.nextBattle + ' Next Battle available'
}

class AlertHandler {
  constructor(telegram) {
    this.telegram = telegram
    this.alertsOfUsers = {}
  }

  generateUpcomingEventsList({buildings: buildingsToShow, gameInformation} = {}) {
    let eventList = []

    const {battleSoloTimestamp, battleAllianceTimestamp, domainStats} = gameInformation
    const {karma} = domainStats || {}
    const lastAttackTimestamp = Math.max(battleSoloTimestamp || 0, battleAllianceTimestamp || 0)
    const minutesTillNextSoloAttack = karma < 0 ? 5 : 10
    eventList.push({
      type: 'nextBattle',
      timestamp: lastAttackTimestamp + (60 * minutesTillNextSoloAttack),
      text: 'You can attack again',
      alertMessage: 'You can attack again. I wish you luck. ☺️'
    })
    eventList.push({
      type: 'nextBattle',
      timestamp: battleAllianceTimestamp + (60 * 60),
      text: 'Your next alliance attack is available',
      alertHeadsUpTime: 60 * 1,
      alertMessage: 'Your next alliance attack is available in 1 min. Get ready and spread the hype! 🥳😎'
    })

    const {resources, resourcesTimestamp} = gameInformation
    const resourceTimestampMinutes = Math.floor(resourcesTimestamp / 60)
    const buildings = {...gameInformation.buildings, ...gameInformation.workshop}
    buildingsToShow = buildingsToShow || defaultBuildingsToShow
    if (resources) {
      const storageCapacity = calcStorageCapacity(buildings.storage)
      const goldCapacity = calcGoldCapacity(buildings.townhall)
      const buildingUpgradeEvents = Object.keys(buildingNames)
        .filter(o => buildingsToShow.indexOf(o) >= 0)
        .map(buildingName => ({
          name: buildingName,
          cost: calcBuildingCost(buildingName, buildings[buildingName])
        }))
        .filter(({cost}) => cost.gold <= goldCapacity)
        .filter(({cost}) => cost.wood <= storageCapacity)
        .filter(({cost}) => cost.stone <= storageCapacity)
        .map(o => {
          o.minutesNeeded = calcMinutesNeeded(o.cost, buildings, resources)
          return o
        })
        .filter(o => o.minutesNeeded > 0)
        .map(o => {
          o.timestamp = (resourceTimestampMinutes + o.minutesNeeded) * 60
          return o
        })
        .map(o => ({
          type: 'buildingUpgrade',
          timestamp: o.timestamp,
          text: buildingNames[o.name] + ' can be upgraded'
        }))
      eventList = eventList.concat(buildingUpgradeEvents)
    }

    const {effects, effectsTimestamp} = gameInformation
    if (effects) {
      const effectEvents = effects
        .map(effect => {
          let {timestamp} = effect
          if (!timestamp) {
            timestamp = effectsTimestamp + (effect.minutesRemaining * 60)
          }
          return {
            type: 'effect',
            timestamp,
            text: `Effect ${effect.emoji} \`${effect.name}\` ends`
          }
        })
      eventList = eventList.concat(effectEvents)
    }

    return eventList
  }

  recreateAlerts(user, session) {
    const oldAlerts = this.alertsOfUsers[user] || []
    oldAlerts
      .filter(o => o.timeoutID)
      .forEach(o => {
        clearTimeout(o.timeoutID)
      })

    const enabledAlerts = session.alerts || []
    const eventList = this.generateUpcomingEventsList(session)
      .filter(o => enabledAlerts.indexOf(o.type) >= 0)

    const newAlerts = eventList.map(event => this.createAlertForEvent(user, event))

    this.alertsOfUsers[user] = newAlerts
  }

  createAlertForEvent(user, event) {
    const unixTimestamp = event.timestamp - (event.alertHeadsUpTime || 0)
    const timestamp = unixTimestamp * 1000
    const timeoutID = createAlertAtTimestamp(timestamp, () => this.sendAlertForEvent(user, event))
    if (timeoutID) {
      event.timeoutID = timeoutID
    }
    return event
  }

  sendAlertForEvent(user, {type, alertMessage, text}) {
    let message = alertEmojis.enabled
    message += alertEmojis[type]
    message += alertMessage || text

    const keyboard = Markup.inlineKeyboard([
      Markup.urlButton(emoji.backTo + 'Open BastionSiege…', 'https://t.me/BastionSiegeBot')
    ])
    this.telegram.sendMessage(user, message, Extra.markdown().markup(keyboard))
  }
}

module.exports = Object.assign(AlertHandler, {
  alertEmojis,
  ALERT_TYPES
})
