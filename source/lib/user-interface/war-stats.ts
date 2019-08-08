import {calcBarracksCapacity, BattleAlliance} from 'bastion-siege-logic'

import * as playerStatsDb from '../data/playerstats-db'
import * as userSessions from '../data/user-sessions'
import {MAX_PLAYER_AGE_DAYS, MAX_BUILDING_AGE_DAYS} from '../data/poweruser'

import {ONE_DAY_IN_SECONDS} from '../math/unix-timestamp'

import {createPlayerMarkdownLink, createPlayerNameString, createTwoSidesStatsString, createTwoSidesOneLineString} from './player-stats'

type Dictionary<T> = {[key: string]: T}

const MAXIMUM_BUILDINGS_AGE = ONE_DAY_IN_SECONDS * MAX_BUILDING_AGE_DAYS
const MAXIMUM_PLAYER_AGE = ONE_DAY_IN_SECONDS * MAX_PLAYER_AGE_DAYS

const MINIMUM_BATTLE_SOLO_AGE = 60 * 10
const MINIMUM_BATTLE_ALLIANCE_AGE = 60 * 60

export function createWarOneLineString(battle: BattleAlliance): string {
  const attackStats = battle.attack
    .map(o => playerStatsDb.get(o))
  const defenceStats = battle.defence
    .map(o => playerStatsDb.get(o))
  return createTwoSidesOneLineString(attackStats, defenceStats)
}

export function createWarStats(timestamp: number, battle: BattleAlliance, player: {name: string; alliance: string}): string {
  const friends = battle.attack.includes(player.name) ? battle.attack : battle.defence
  const poweruserFriends = userSessions.getRaw()
    .map(o => o.data.gameInformation)
    .filter(o => o.player && friends.includes(o.player.name))
    .filter(o => o.buildingsTimestamp && o.buildingsTimestamp + MAXIMUM_BUILDINGS_AGE > timestamp)
    .map(o => ({
      alliance: o.player!.alliance,
      player: o.player!.name,
      barracks: o.buildings!.barracks,
      army: calcBarracksCapacity(o.buildings!.barracks)
    }))

  const additionalArmyInformation: Dictionary<number> = {}
  for (const o of poweruserFriends) {
    additionalArmyInformation[o.player] = o.army
  }

  const notPowerusers = friends
    .filter(o => !poweruserFriends.map(o => o.player).includes(o))

  const missingFriends = userSessions.getRaw()
    .filter(o => {
      const {gameInformation} = o.data
      if (!gameInformation.playerTimestamp || !gameInformation.player) {
        return false
      }

      return gameInformation.playerTimestamp + MAXIMUM_PLAYER_AGE > timestamp &&
        player.alliance &&
        gameInformation.player.alliance === player.alliance &&
        !friends.includes(gameInformation.player.name) &&
        (gameInformation.battleAllianceTimestamp || 0) + MINIMUM_BATTLE_ALLIANCE_AGE < timestamp &&
        (gameInformation.battleSoloTimestamp || 0) + MINIMUM_BATTLE_SOLO_AGE < timestamp
    })
    .map(({user, data}) => ({user, player: data.gameInformation.player!.name}))

  const attackStats = battle.attack
    .map(o => playerStatsDb.get(o))
  const defenceStats = battle.defence
    .map(o => playerStatsDb.get(o))
  const statsString = createTwoSidesStatsString(attackStats, defenceStats, additionalArmyInformation)

  let text = ''

  if (missingFriends.length > 0) {
    text += player.alliance + ' '
    text += `Missing (${missingFriends.length}): `
    text += missingFriends
      .sort((a, b) => a.player.localeCompare(b.player))
      .map(o => createPlayerMarkdownLink(o.user, o))
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
