import {PlayerStats} from '../types'

import {replaceLookingLikeAsciiChars} from '../javascript-abstraction/strings'
import {sortBy} from '../javascript-abstraction/array'

import {generate} from '../math/player-stats'
import {getMidnightXDaysEarlier} from '../math/unix-timestamp'

import * as battlereports from './ingame/battlereports'

interface PlayerReportEntry {
  withReports: number;
  stats: PlayerStats;
}

const playerStats: Record<string, PlayerReportEntry> = {}

export function get(player: string): PlayerStats {
  const reports = battlereports.getByTargetPlayername(player)
  const withReports = playerStats[player] ? playerStats[player].withReports : 0

  if (withReports < reports.length || !playerStats[player]) {
    // Providing the current time to something that will be cached is strange
    const newStats = generate(reports, player, Date.now() / 1000)
    playerStats[player] = {
      withReports: reports.length,
      stats: newStats
    }
  }

  return playerStats[player].stats
}

export function getLookingLike(player: string, terra = NaN, onlyFromNearPast = true): PlayerStats[] {
  const searched = replaceLookingLikeAsciiChars(player)
  const allLookingAlike = list()
    .filter(o => o.playerNameLookingLike === searched)
    // NaN of o.terra does not change the order -> use time as fallback
    .sort(sortBy(o => o.lastBattleTime, true))
    .sort(sortBy(o => Math.abs(o.terra - terra)))

  return onlyFromNearPast ? filterNearPast(allLookingAlike) : allLookingAlike
}

export function getFromShortened(playerShortened: string, onlyFromNearPast = true): PlayerStats[] {
  const searched = playerShortened.endsWith('~') ? playerShortened.slice(0, playerShortened.length - 1) : playerShortened
  if (searched.length !== 13) {
    throw new Error('shortened name does not seem to be from a ranking')
  }

  const allLookingAlike = list()
    .filter(o => o.player.startsWith(searched))
    .sort(sortBy(o => o.lastBattleTime, true))

  return onlyFromNearPast ? filterNearPast(allLookingAlike) : allLookingAlike
}

function filterNearPast(all: PlayerStats[]): PlayerStats[] {
  const minDate = getMidnightXDaysEarlier(Date.now() / 1000, 30)
  const newEnoughExist = all.some(o => o.lastBattleTime > minDate)
  if (!newEnoughExist) {
    return all
  }

  return all.filter(o => o.lastBattleTime > minDate)
}

export function list(): PlayerStats[] {
  return battlereports.listTargetPlayernames()
    .map(name => get(name))
}
