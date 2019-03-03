const playerStatsDb = require('../data/playerstats-db')
const poweruser = require('../data/poweruser')

const {calcBarracksCapacity} = require('../math/siegemath')
const {ONE_DAY_IN_SECONDS} = require('../math/unix-timestamp')

const {createPlayerNameString, createTwoSidesStatsString} = require('./player-stats')

function createWarStats(timestamp, battle, playername) {
  const minimumBuildingTimestamp = timestamp - (ONE_DAY_IN_SECONDS * 7)

  const friends = battle.attack.includes(playername) ? battle.attack : battle.defence
  const poweruserFriends = poweruser.getPoweruserSessions()
    .map(o => o.data.gameInformation)
    .filter(o => o.player && friends.includes(o.player.name))
    .filter(o => o.buildingsTimestamp > minimumBuildingTimestamp)
    .map(o => ({
      alliance: o.player.alliance,
      player: o.player.name,
      barracks: o.buildings.barracks,
      army: calcBarracksCapacity(o.buildings.barracks)
    }))

  const additionalArmyInformation = {}
  for (const o of poweruserFriends) {
    additionalArmyInformation[o.player] = o.army
  }

  const notPowerusers = friends
    .filter(o => !poweruserFriends.map(o => o.player).includes(o))

  const attackStats = battle.attack
    .map(o => playerStatsDb.get(o))
  const defenceStats = battle.defence
    .map(o => playerStatsDb.get(o))
  const statsString = createTwoSidesStatsString(attackStats, defenceStats, additionalArmyInformation)

  let text = ''

  if (notPowerusers.length > 0) {
    text += 'Not a poweruser or buildings not up to date:\n'
    text += notPowerusers
      .map(o => createPlayerNameString({player: o}, true))
      .join(', ')
    text += '\n\n'
  }

  text += statsString

  return text
}

module.exports = {
  createWarStats
}
