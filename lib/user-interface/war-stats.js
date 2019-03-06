const playerStatsDb = require('../data/playerstats-db')
const userSessions = require('../data/user-sessions')

const {calcBarracksCapacity} = require('../math/siegemath')
const {ONE_DAY_IN_SECONDS} = require('../math/unix-timestamp')

const {createPlayerNameString, createTwoSidesStatsString, createTwoSidesOneLineString} = require('./player-stats')

const MAXIMUM_BUILDINGS_AGE = ONE_DAY_IN_SECONDS * 7
const MAXIMUM_PLAYER_AGE = ONE_DAY_IN_SECONDS * 7

const MINIMUM_BATTLE_SOLO_AGE = 60 * 10
const MINIMUM_BATTLE_ALLIANCE_AGE = 60 * 60

function createWarOneLineString(battle) {
  const attackStats = battle.attack
    .map(o => playerStatsDb.get(o))
  const defenceStats = battle.defence
    .map(o => playerStatsDb.get(o))
  return createTwoSidesOneLineString(attackStats, defenceStats)
}

function createWarStats(timestamp, battle, player) {
  const friends = battle.attack.includes(player.name) ? battle.attack : battle.defence
  const poweruserFriends = userSessions.getRaw()
    .map(o => o.data.gameInformation)
    .filter(o => o.player && friends.includes(o.player.name))
    .filter(o => o.buildingsTimestamp + MAXIMUM_BUILDINGS_AGE > timestamp)
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

  const missingFriends = userSessions.getRaw()
    .filter(o => o.data.gameInformation.playerTimestamp + MAXIMUM_PLAYER_AGE > timestamp)
    .filter(o => o.data.gameInformation.player.alliance === player.alliance)
    .filter(o => !friends.includes(o.data.gameInformation.player.name))
    .filter(o => o.data.gameInformation.battleAllianceTimestamp + MINIMUM_BATTLE_ALLIANCE_AGE < timestamp)
    .filter(o => o.data.gameInformation.battleSoloTimestamp + MINIMUM_BATTLE_SOLO_AGE < timestamp)
    .map(({user, data}) => ({user, player: data.gameInformation.player}))

  const attackStats = battle.attack
    .map(o => playerStatsDb.get(o))
  const defenceStats = battle.defence
    .map(o => playerStatsDb.get(o))
  const statsString = createTwoSidesStatsString(attackStats, defenceStats, additionalArmyInformation)

  let text = ''

  if (missingFriends.length > 0) {
    text += player.alliance + ' Missing: '
    text += missingFriends
      .sort((a, b) => a.player.name.localeCompare(b.player.name))
      .map(o => `[${createPlayerNameString({player: o.player.name})}](tg://user?id=${o.user})`)
      .join(', ')
    text += '\n\n'
  }

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
  createWarOneLineString,
  createWarStats
}
