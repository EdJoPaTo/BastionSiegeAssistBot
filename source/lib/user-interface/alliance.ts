import * as playerStatsDb from '../data/playerstats-db'
import * as userSessions from '../data/user-sessions'

import {createPlayerMarkdownLink, createPlayerNameString} from './player-stats'
import {PlayerStats} from '../types'

export interface MissingAllianceMates {
  readonly alliance: string;
  readonly users: readonly userSessions.SessionRaw[];
  readonly nonUsers: readonly PlayerStats[];
}

export function getMissingAllianceMates(alliance: string, participants: string[]): MissingAllianceMates {
  const users = userSessions.getRawInAlliance(alliance)
    .filter(o => !participants.includes(o.data.gameInformation.player!.name))

  const knownNames = new Set([
    ...users.map(o => o.data.gameInformation.player!.name),
    ...participants
  ])
  const nonUsers = playerStatsDb.getInAlliance(alliance, 7)
    .filter(o => !knownNames.has(o.player))
  return {alliance, users, nonUsers}
}

export function getMissingAllianceMateMarkdownList(alliance: string, participants: string[]): string[] {
  const missingMates = getMissingAllianceMates(alliance, participants)
  return createMissingMatesMarkdownList(missingMates)
}

export function createMissingMatesMarkdownList(missingMates: MissingAllianceMates): string[] {
  const missingEntries: string[] = []
  missingEntries.push(...missingMates.users
    .map(({user, data}) => ({user, player: data.gameInformation.player!.name}))
    .sort((a, b) => a.player.localeCompare(b.player))
    .map(o => createPlayerMarkdownLink(o.user, o))
  )
  missingEntries.push(...missingMates.nonUsers
    .map(o => o.player)
    .sort((a, b) => a.localeCompare(b))
    .map(o => createPlayerNameString({player: o}, true) + '?')
  )
  return missingEntries
}
