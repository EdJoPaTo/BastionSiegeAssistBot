import {Castle, castleGametext, calcBarracksCapacity} from 'bastion-siege-logic'
import arrayFilterUnique from 'array-filter-unique'

import * as castles from '../data/castles'
import * as castleSiege from '../data/castle-siege'
import * as playerStatsDb from '../data/playerstats-db'
import * as userSessions from '../data/user-sessions'

import {createMultipleStatsConclusion, createPlayerStatsSingleLineString} from './player-stats'
import {getMissingAllianceMates, createMissingMatesMarkdownList} from './alliance'

export interface CastlePartOptions {
  readonly userIsPoweruser: boolean;
  readonly userAlliance: string | undefined;
  readonly locale?: string;
  readonly timeZone?: string;
  readonly now: number;
}

function castleFormattedTimestampBegin(castle: Castle, locale: string | undefined, timeZone = 'UTC'): string {
  return new Date(castles.nextSiegeAvailable(castle) * 1000).toLocaleString(locale, {
    timeZone,
    hour12: false,
    year: undefined,
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  })
}

function castleFormattedTimestampEnd(castle: Castle, locale: string | undefined, timeZone = 'UTC'): string {
  return new Date(castles.nextSiegeBeginsFight(castle) * 1000).toLocaleTimeString(locale, {
    timeZone,
    timeZoneName: 'short',
    hour12: false,
    hour: 'numeric',
    minute: '2-digit'
  })
}

function castleHeader(castle: Castle, currentKeeper: string | undefined, locale: string | undefined, timeZone: string | undefined): string {
  let text = ''
  if (currentKeeper) {
    text += currentKeeper
  }

  text += '*'
  text += castleGametext(castle, locale === 'ru' ? 'ru' : 'en')
  text += '*'
  text += '\n'
  text += castleFormattedTimestampBegin(castle, locale, timeZone)
  text += ' - '
  text += castleFormattedTimestampEnd(castle, locale, timeZone)
  text += '\n'
  return text
}

function otherParticipantsArmyEstimation(participatingAlliances: readonly string[]): string {
  const text = participatingAlliances
    .map(o => playerStatsDb.getInAlliance(o, 7))
    .filter(o => o.length >= 5)
    .map(o => createMultipleStatsConclusion(o))
    .map(o => o.armyString)
    .join('\n')

  return text + '\n'
}

export function castlePart(castle: Castle, options: CastlePartOptions): string {
  const {userIsPoweruser, userAlliance, locale, timeZone, now} = options
  let part = ''

  const keeper = castles.currentKeeperAlliance(castle)
  part += castleHeader(castle, keeper, locale, timeZone)

  if (!castles.isCurrentlySiegeAvailable(castle, now) || !userIsPoweruser) {
    return part
  }

  const participatingAlliances = [
    keeper,
    ...castleSiege.getAlliances(castle, now)
  ].filter((o): o is string => Boolean(o)).filter(arrayFilterUnique())

  part += otherParticipantsArmyEstimation(participatingAlliances.filter(o => o !== userAlliance))

  if (userAlliance && participatingAlliances.includes(userAlliance)) {
    part += '\n'
    const participants = castleSiege.getParticipants(castle, userAlliance, now)
      .map(o => playerStatsDb.get(o.player))

    const missingMates = getMissingAllianceMates(userAlliance, participants.map(o => o.player))
    const missingEntries = createMissingMatesMarkdownList(missingMates)
    if (missingEntries.length > 0) {
      part += userAlliance + ' '
      part += `Missing (${missingEntries.length}): `
      part += missingEntries
        .join(', ')
      part += '\n\n'
    }

    const knownArmiesArray = userSessions.getRawInAlliance(userAlliance)
      .map(o => o.data.gameInformation)
      .filter(o => o.player && o.buildings)
      .map(o => ({
        player: o.player!.name,
        army: calcBarracksCapacity(o.buildings!.barracks)
      }))
    const knownArmies: Record<string, number> = {}
    for (const o of knownArmiesArray) {
      knownArmies[o.player] = o.army
    }

    part += createMultipleStatsConclusion(participants, knownArmies).armyString
    part += '\n'

    part += participants
      .map(stats => {
        const userId = userSessions.getUserIdByName(stats.player)
        const armyOverride = knownArmies[stats.player]
        return createPlayerStatsSingleLineString(stats, userId, armyOverride)
      })
      .join('\n')

    part += '\n'
  }

  return part
}
