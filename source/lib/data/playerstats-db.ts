import {Battlereport} from 'bastion-siege-logic'

import {PlayerStats} from '../types'

import {replaceLookingLikeAsciiChars} from '../javascript-abstraction/strings'
import {sortBy} from '../javascript-abstraction/array'

import {generate} from '../math/player-stats'
import {getMidnightXDaysEarlier} from '../math/unix-timestamp'

type Dictionary<T> = {[key: string]: T}

interface PlayerReportEntry {
  withReports: number;
  stats: PlayerStats;
}

const playerReports: Dictionary<Battlereport[]> = {}
const playerStats: Dictionary<PlayerReportEntry> = {}

export function addReport(report: Battlereport): void {
  const {enemies} = report

  for (const enemy of enemies) {
    if (!playerReports[enemy]) {
      playerReports[enemy] = []
    }

    playerReports[enemy].push(report)
  }
}

export function get(player: string): PlayerStats {
  const reports = playerReports[player] || []
  const withReports = (playerStats[player] || {}).withReports || 0

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

export function getLookingLike(player: string, terra = NaN, onlyFromNearPast = true): readonly PlayerStats[] {
  const searched = replaceLookingLikeAsciiChars(player)
  const allLookingAlike = list()
    .filter(o => o.playerNameLookingLike === searched)
    // NaN of o.terra does not change the order -> use time as fallback
    .sort(sortBy(o => o.lastBattleTime, true))
    .sort(sortBy(o => Math.abs(o.terra - terra)))

  if (!onlyFromNearPast) {
    return allLookingAlike
  }

  const minDate = getMidnightXDaysEarlier(Date.now() / 1000, 30)
  const newEnoughAmount = allLookingAlike
    .filter(o => o.lastBattleTime > minDate)
    .length

  return allLookingAlike
    .filter(o => newEnoughAmount === 0 ? true : o.lastBattleTime > minDate)
}

export function list(): readonly PlayerStats[] {
  return Object.keys(playerReports)
    .map(name => get(name))
}

module.exports = {
  addReport,
  get,
  getLookingLike,
  list
}
