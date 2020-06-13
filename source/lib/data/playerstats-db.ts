import {PlayerStats} from '../types'

import {replaceLookingLikeAsciiChars} from '../javascript-abstraction/strings'
import {sortBy} from '../javascript-abstraction/array'

import {generate} from '../math/player-stats'
import {filterMaxDays} from '../math/unix-timestamp'

import * as battlereports from './ingame/battlereports'

interface PlayerReportEntry {
  readonly withReports: number;
  readonly stats: PlayerStats;
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

export function getLookingLike(player: string, terra = Number.NaN, onlyFromNearPast = true): PlayerStats[] {
  const searched = replaceLookingLikeAsciiChars(player)
  const allLookingAlike = list()
    .filter(o => o.playerNameLookingLike === searched)
    // NaN of o.terra does not change the order -> use time as fallback
    .sort(sortBy(o => o.lastBattleTime, true))
    .sort(sortBy(o => Math.abs(o.terra - terra)))

  return onlyFromNearPast ? filterNearPastWithFallback(allLookingAlike) : allLookingAlike
}

export function getFromShortened(playerShortened: string, onlyFromNearPast = true): PlayerStats[] {
  const searched = playerShortened.endsWith('~') ? playerShortened.slice(0, -1) : playerShortened
  if (searched.length !== 13) {
    throw new Error('shortened name does not seem to be from a ranking')
  }

  const allLookingAlike = list()
    .filter(o => o.player.startsWith(searched))
    .sort(sortBy(o => o.lastBattleTime, true))

  return onlyFromNearPast ? filterNearPastWithFallback(allLookingAlike) : allLookingAlike
}

export function getInAlliance(alliance: string | undefined, maxAgeDays: number): PlayerStats[] {
  const searched = list()
    .filter(o => o.alliance === alliance)
    .filter(filterMaxDays(maxAgeDays, o => o.lastBattleTime))

  return searched
}

function filterNearPastWithFallback(all: PlayerStats[], days = 14, fallbackOlder = true): PlayerStats[] {
  const filtered = all.filter(filterMaxDays(days, o => o.lastBattleTime))

  if (filtered.length === 0 && fallbackOlder) {
    return all
  }

  return filtered
}

export function list(): PlayerStats[] {
  return battlereports.listTargetPlayernames()
    .map(name => get(name))
}
