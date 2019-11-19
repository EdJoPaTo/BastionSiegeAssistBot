import {Battlereport} from 'bastion-siege-logic'

import {PoweruserCondition} from '../types'

import {getHoursEarlier, getMidnightXDaysEarlier} from '../math/unix-timestamp'

import * as userSessions from './user-sessions'

import * as battlereports from './ingame/battlereports'

export const MAX_BUILDING_AGE_DAYS = 7
export const MAX_PLAYER_AGE_DAYS = 3
export const MAX_WORKSHOP_AGE_DAYS = 14
export const RELEVANT_REPORT_DAYS = 7

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
    status: Boolean(playerTimestamp && playerTimestamp > getMidnightXDaysEarlier(now, MAX_PLAYER_AGE_DAYS)),
    warning: Boolean(playerTimestamp && playerTimestamp < getMidnightXDaysEarlier(now, 2)),
    type: 'name'
  })

  conditions.push({
    required: true,
    status: Boolean(buildingsTimestamp && buildingsTimestamp > getMidnightXDaysEarlier(now, MAX_BUILDING_AGE_DAYS)),
    warning: Boolean(buildingsTimestamp && buildingsTimestamp < getMidnightXDaysEarlier(now, 4)),
    type: 'buildings'
  })

  conditions.push({
    required: true,
    status: Boolean(workshopTimestamp && workshopTimestamp > getMidnightXDaysEarlier(now, MAX_WORKSHOP_AGE_DAYS)),
    warning: Boolean(workshopTimestamp && workshopTimestamp < getMidnightXDaysEarlier(now, 10)),
    type: 'workshop'
  })

  return conditions
}

function getRelevantReports(id: number): readonly Battlereport[] {
  const now = Date.now() / 1000
  const minDate = getMidnightXDaysEarlier(now, RELEVANT_REPORT_DAYS)
  const relevantReports = battlereports.getRelevantForPoweruser(id, minDate)
  return relevantReports
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

  if (!id || !isPoweruser(id)) {
    return false
  }

  const session = userSessions.getUser(id)
  if (session.disableImmunity) {
    return false
  }

  return true
}
