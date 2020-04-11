import {calcBarracksCapacity, BattleAlliance} from 'bastion-siege-logic'

import * as playerStatsDb from '../data/playerstats-db'
import * as userSessions from '../data/user-sessions'
import {MAX_BUILDING_AGE_DAYS} from '../data/poweruser'

import {ONE_DAY_IN_SECONDS} from '../math/unix-timestamp'

import {createPlayerNameString, createTwoSidesStatsString, createTwoSidesOneLineString} from './player-stats'
import {getMissingAllianceMates, createMissingMatesMarkdownList} from './alliance'

const MAXIMUM_BUILDINGS_AGE = ONE_DAY_IN_SECONDS * MAX_BUILDING_AGE_DAYS

const MINIMUM_BATTLE_SOLO_AGE = 60 * 10
const MINIMUM_BATTLE_ALLIANCE_AGE = 60 * 60

export function createWarOneLineString(battle: BattleAlliance): string {
  const attackStats = battle.attack
    .map(o => playerStatsDb.get(o))
  const defenceStats = battle.defence
    .map(o => playerStatsDb.get(o))
  return createTwoSidesOneLineString(attackStats, defenceStats)
}

export function createWarStats(timestamp: number, battle: BattleAlliance, player: {name: string; alliance?: string}): string {
  const friends = battle.attack.includes(player.name) ? battle.attack : battle.defence
  const poweruserFriends = userSessions.getRaw()
    .filter(o => {
      const {player, buildingsTimestamp} = o.data.gameInformation
      if (!player || !friends.includes(player.name)) {
        return false
      }

      if (!buildingsTimestamp || buildingsTimestamp + MAXIMUM_BUILDINGS_AGE < timestamp) {
        return false
      }

      return true
    })
    .map(o => {
      const {player, buildings} = o.data.gameInformation
      return {
        id: o.user,
        alliance: player!.alliance,
        player: player!.name,
        barracks: buildings!.barracks,
        army: calcBarracksCapacity(buildings!.barracks)
      }
    })

  const additionalArmyInformation: Record<string, number> = {}
  for (const o of poweruserFriends) {
    additionalArmyInformation[o.player] = o.army
  }

  const userIds: Record<string, number> = {}
  for (const o of poweruserFriends) {
    userIds[o.player] = o.id
  }

  const notPowerusers = friends
    .filter(o => !poweruserFriends.map(o => o.player).includes(o))

  const attackStats = battle.attack
    .map(o => playerStatsDb.get(o))
  const defenceStats = battle.defence
    .map(o => playerStatsDb.get(o))
  const statsString = createTwoSidesStatsString(attackStats, defenceStats, additionalArmyInformation, userIds)

  let text = ''

  if (player.alliance) {
    const missingMates = getMissingAllianceMates(player.alliance, friends)
    const filteredUsers = missingMates.users
      .filter(o => {
        const {gameInformation} = o.data
        return !friends.includes(gameInformation.player!.name) &&
          (gameInformation.battleAllianceTimestamp || 0) + MINIMUM_BATTLE_ALLIANCE_AGE < timestamp &&
          (gameInformation.battleSoloTimestamp || 0) + MINIMUM_BATTLE_SOLO_AGE < timestamp
      })
    const missing = createMissingMatesMarkdownList({
      ...missingMates,
      users: filteredUsers
    })
    if (missing.length > 0) {
      text += player.alliance
      text += ' '
      text += `Missing (${missing.length}): `
      text += missing
        .join(', ')
      text += '\n\n'
    }
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
