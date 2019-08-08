import {Battlereport} from 'bastion-siege-logic'

import {BattlereportInMemory, PoweruserCondition} from '../types'

import {getHoursEarlier, getMidnightXDaysEarlier} from '../math/unix-timestamp'

import * as userSessions from './user-sessions'

type Dictionary<T> = {[key: string]: T}

export const MAX_BUILDING_AGE_DAYS = 7
export const MAX_PLAYER_AGE_DAYS = 3
export const MAX_WORKSHOP_AGE_DAYS = 14
export const RELEVANT_REPORT_DAYS = 7

const soloReportsOfUser: Dictionary<BattlereportInMemory[]> = {}

export function addReport(report: BattlereportInMemory): void {
  // Only solo reports
  if (report.friends.length > 1) {
    return
  }

  // An old report that is not to be considered
  // This is using the time of adding so it has to be checked later too
  // But this is a good prefilter
  const now = Date.now() / 1000
  if (report.time < getMidnightXDaysEarlier(now, RELEVANT_REPORT_DAYS)) {
    return
  }

  if (!soloReportsOfUser[report.providingTgUser]) {
    soloReportsOfUser[report.providingTgUser] = []
  }

  soloReportsOfUser[report.providingTgUser].push(report)
}

export function isPoweruser(id: number): boolean {
  const conditions = getConditions(id)
    .filter(o => o.required)

  const allTrue = conditions
    .every(o => o.status)
  return allTrue
}

export function getConditions(id: number): readonly PoweruserCondition[] {
  const now = Date.now() / 1000
  const gameInformation = (userSessions.getUser(id) || {}).gameInformation || {}
  const {buildingsTimestamp, playerTimestamp, workshopTimestamp} = gameInformation

  const conditions: PoweruserCondition[] = []

  conditions.push({
    required: true,
    status: hasSendEnoughReports(id),
    warning: !hasEasilySendEnoughReports(id),
    type: 'battlereports'
  })

  conditions.push({
    required: true,
    status: playerTimestamp && playerTimestamp > getMidnightXDaysEarlier(now, MAX_PLAYER_AGE_DAYS),
    warning: playerTimestamp && playerTimestamp < getMidnightXDaysEarlier(now, 2),
    type: 'name'
  })

  conditions.push({
    required: true,
    status: buildingsTimestamp && buildingsTimestamp > getMidnightXDaysEarlier(now, MAX_BUILDING_AGE_DAYS),
    warning: buildingsTimestamp && buildingsTimestamp < getMidnightXDaysEarlier(now, 4),
    type: 'buildings'
  })

  conditions.push({
    required: true,
    status: workshopTimestamp && workshopTimestamp > getMidnightXDaysEarlier(now, MAX_WORKSHOP_AGE_DAYS),
    warning: workshopTimestamp && workshopTimestamp < getMidnightXDaysEarlier(now, 10),
    type: 'workshop'
  })

  return conditions
}

function getRelevantReports(id: number): readonly Battlereport[] {
  if (!soloReportsOfUser[id]) {
    return []
  }

  const now = Date.now() / 1000

  const minDate = getMidnightXDaysEarlier(now, RELEVANT_REPORT_DAYS)
  soloReportsOfUser[id] = soloReportsOfUser[id]
    .filter(o => o.time > minDate)

  return soloReportsOfUser[id]
}

export function hasSendEnoughReports(id: number): boolean {
  // Provided at least 5 reports per day
  return getRelevantReports(id).length >= RELEVANT_REPORT_DAYS * 5
}

function hasEasilySendEnoughReports(id: number): boolean {
  const now = Date.now() / 1000
  const minDate = getHoursEarlier(now, 24)
  const reports = getRelevantReports(id)
    .filter(o => o.time > minDate)

  // Provided at least 10 reports within 24h
  return reports.length >= 10
}

export function getReportsTodayAmount(id: number): number {
  const now = Date.now() / 1000
  const minDate = getMidnightXDaysEarlier(now, 1)
  const reports = getRelevantReports(id)
    .filter(o => o.time > minDate)

  return reports.length
}

export function getPoweruserSessions(): readonly userSessions.SessionRaw[] {
  return userSessions.getRaw()
    .filter(o => isPoweruser(o.user))
}

export function isImmune(playername: string): boolean {
  const id = userSessions.getUserIdByName(playername)

  if (!isPoweruser(id)) {
    return false
  }

  const session = userSessions.getUser(id)
  if (session.disableImmunity) {
    return false
  }

  return true
}

module.exports = {
  MAX_BUILDING_AGE_DAYS,
  MAX_PLAYER_AGE_DAYS,
  MAX_WORKSHOP_AGE_DAYS,
  RELEVANT_REPORT_DAYS,
  addReport,
  getConditions,
  getPoweruserSessions,
  getReportsTodayAmount,
  hasSendEnoughReports,
  isImmune,
  isPoweruser
}
