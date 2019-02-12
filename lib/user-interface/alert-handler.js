const {Extra, Markup} = require('telegraf')

const {createAlertAtTimestamp} = require('../javascript-abstraction/alert')

const {
  calcBuildingCost,
  calcGoldCapacity,
  calcGoldIncome,
  calcMinutesNeeded,
  calcProductionFood,
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
  nextBattle: emoji.army,
  resourceWarning: emoji.food
}

const ALERT_TYPES = {
  buildingUpgrade: alertEmojis.buildingUpgrade + ' Building Upgrade available',
  effect: alertEmojis.effect + ' Effect ended',
  nextBattle: alertEmojis.nextBattle + ' Next Battle available',
  resourceWarning: alertEmojis.resourceWarning + ' Critical Resource Levels reached'
}

class AlertHandler {
  constructor(telegram) {
    this.telegram = telegram
    this.alertsOfUsers = {}
  }

  generateUpcomingEventsList({buildings: buildingsToShow, gameInformation} = {}) {
    let eventList = []

    const {battleSoloTimestamp, battleAllianceTimestamp, domainStats} = gameInformation || {}
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
    if (resources && buildings.townhall) {
      const storageCapacity = calcStorageCapacity(buildings.storage)
      const goldCapacity = calcGoldCapacity(buildings.townhall)
      const buildingUpgradeEvents = Object.keys(buildingNames)
        .filter(o => buildingsToShow.includes(o))
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
          text: `Building ${buildingNames[o.name]} can be upgraded`
        }))
      eventList = eventList.concat(buildingUpgradeEvents)

      const goldProduction = calcGoldIncome(buildings.townhall, buildings.houses)
      const goldFillTimeNeeded = (goldCapacity - resources.gold) / goldProduction
      eventList.push({
        type: 'resourceWarning',
        timestamp: (resourceTimestampMinutes + goldFillTimeNeeded) * 60,
        text: 'Gold full',
        alertHeadsUpTime: 60 * 15, // 15 min earlier
        alertMessage: 'Gold full in 15 min'
      })

      const foodProduction = calcProductionFood(buildings.farm, buildings.houses)
      if (foodProduction < 0) {
        const foodEmptyTimeNeeded = resources.food / -foodProduction
        eventList.push({
          type: 'resourceWarning',
          timestamp: (resourceTimestampMinutes + foodEmptyTimeNeeded) * 60,
          text: 'Food empty',
          alertHeadsUpTime: 60 * 60 * 12, // 12h earlier
          alertMessage: 'Food empty in 12h'
        })
      }
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
      .filter(o => enabledAlerts.includes(o.type))

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
      .catch(error => console.log('send Alert failed', user, error))
  }
}

module.exports = Object.assign(AlertHandler, {
  alertEmojis,
  ALERT_TYPES
})
