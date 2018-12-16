const {createAlertAtTimestamp} = require('../javascript-abstraction/alert')

const {emoji} = require('../input/game-text')

const {
  calcBuildingCost,
  calcGoldCapacity,
  calcMinutesNeeded,
  calcStorageCapacity
} = require('../math/siegemath')

const {
  buildingNames,
  defaultBuildingsToShow
} = require('./buildings')

const alertEmojis = {
  disabled: '🔕',
  enabled: '🔔',
  buildingUpgrade: emoji.houses,
  nextBattle: emoji.army
}

const ALERT_TYPES = {
  buildingUpgrade: alertEmojis.buildingUpgrade + ' Building Upgrade available',
  nextBattle: alertEmojis.nextBattle + ' Next Battle available'
}

class AlertHandler {
  constructor(telegram) {
    this.telegram = telegram
    this.alertsOfUsers = {}
  }

  generateUpcomingEventsList({buildings: buildingsToShow, gameInformation} = {}) {
    let eventList = []

    const {battleSoloTimestamp, battleAllianceTimestamp} = gameInformation
    const lastAttackTimestamp = Math.max(battleSoloTimestamp || 0, battleAllianceTimestamp || 0)
    eventList.push({
      type: 'nextBattle',
      timestamp: lastAttackTimestamp + (60 * 10),
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
          o.timestamp = resourcesTimestamp + (o.minutesNeeded * 60)
          return o
        })
        .map(o => ({
          type: 'buildingUpgrade',
          timestamp: o.timestamp,
          text: buildingNames[o.name] + ' can be upgraded',
          // Resources are not exactly accurate on the minute so send the alert a minute later to be sure its ready.
          alertHeadsUpTime: -60
        }))

      eventList = eventList.concat(buildingUpgradeEvents)
    }

    return eventList
  }

  recreateAlerts(user, enabledAlerts = [], session) {
    const oldAlerts = this.alertsOfUsers[user] || []
    oldAlerts.forEach(o => {
      clearTimeout(o)
    })

    this.alertsOfUsers[user] = []

    const eventList = this.generateUpcomingEventsList(session)
      .filter(o => enabledAlerts.indexOf(o.type) >= 0)

    eventList.forEach(event => {
      const timestamp = event.timestamp - (event.alertHeadsUpTime || 0)
      const message = alertEmojis.enabled + alertEmojis[event.type] + (event.alertMessage || event.text)
      this.createAndAddAlert(user, timestamp, message)
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
