import {Markup} from 'telegraf'
import {calcBarracksCapacity, nextBattleTimestamp} from 'bastion-siege-logic'

import {Session, InlineListParticipant} from '../types'

import {sortBy} from '../javascript-abstraction/array'

import {getMidnightXDaysEarlier} from '../math/unix-timestamp'

import * as attackscouts from '../data/ingame/attackscouts'
import * as lists from '../data/inline-lists'
import * as playerStatsDb from '../data/playerstats-db'
import * as poweruser from '../data/poweruser'
import * as userSessions from '../data/user-sessions'

import {createPlayerMarkdownLink, createPlayerStatsString} from './player-stats'
import {emoji} from './output-text'
import {formatNumberShort, formatTimeAmount} from './format-number'

const ATTACK_SCOUT_MAX_AGE = 60 * 15 // 15 min

interface EntryInformation {
  readonly id: number;
  readonly player: string;
  readonly alliance?: string;
  readonly isPoweruser: boolean;
  readonly lastUpdate: number;
  readonly nextAllianceAttack: number;
  readonly barracks?: number;
  readonly trebuchet?: number;
}

export function createList(creatorId: number, listId: string, now: number): {text: string; keyboard: any} {
  const list = lists.getList(creatorId, listId, now)
  const {participants} = list

  const entries = Object.keys(participants)
    .map(o => Number(o))
    .map(id => getEntryInformation(id, participants[id], userSessions.getUser(id), now))
    .sort(sortBy(o => o.barracks || 0, true))

  let text = ''

  text += emoji.list + ' *List*\n'
  const statsLine = createStatsLine(entries, now)
  if (statsLine.length > 0) {
    text += statsLine.join('  ')
    text += '\n'
  }

  text += '\n'
  if (entries.length === 0) {
    text += '👻 Its lonely…'
  }

  text += entries
    .map(o => createEntryString(o, now))
    .join('\n')

  text += '\n\n'

  const creatorSession = userSessions.getUser(creatorId)
  const attackscout = attackscouts.getLastAttackscoutOfUser(creatorId)
  const {battleAllianceTimestamp, battleSoloTimestamp} = creatorSession.gameInformation
  const lastBattle = Math.max(battleAllianceTimestamp || 0, battleSoloTimestamp || 0)
  if (attackscout &&
    attackscout.time > lastBattle &&
    attackscout.time > now - ATTACK_SCOUT_MAX_AGE
  ) {
    const statsArr = playerStatsDb.getLookingLike(attackscout.player.name, attackscout.terra, true)
    text += statsArr
      .map(o => createPlayerStatsString(o, creatorSession.timeZone || 'UTC'))
      .join('\n\n')
    text += '\n\n'
  }

  const buttonPrefix = `inlineList:${creatorId}:${listId}:`
  const keyboard = Markup.inlineKeyboard([
    Markup.callbackButton('➕ Join', buttonPrefix + 'join:'),
    Markup.callbackButton('➖ Leave', buttonPrefix + 'leave', Object.keys(participants).length === 0)
  ])

  return {text, keyboard}
}

function createStatsLine(entries: readonly EntryInformation[], now: number): string[] {
  const totalArmy = entries
    .map(o => calcBarracksCapacity(o.barracks || 0))
    .reduce((a, b) => a + b, 0)

  const nextAllianceAttack = Math.max(
    ...entries.map(o => o.nextAllianceAttack)
  )
  const secondsUntilNextAllianceAttack = nextAllianceAttack - now

  const statsLine = []
  statsLine.push(`${formatNumberShort(totalArmy, true)}${emoji.army}`)
  statsLine.push(`≤${formatNumberShort(totalArmy * 500, true)}${emoji.gold}`)

  if (secondsUntilNextAllianceAttack > 0) {
    statsLine.push(formatTimeAmount(secondsUntilNextAllianceAttack / 60))
  }

  return statsLine
}

function getEntryInformation(userId: number, listEntry: InlineListParticipant, session: Session, now: number): EntryInformation {
  const information = session.gameInformation
  const {battleSoloTimestamp, battleAllianceTimestamp, domainStats, playerTimestamp, buildingsTimestamp, workshopTimestamp} = information

  const minPlayerTimestamp = getMidnightXDaysEarlier(now, poweruser.MAX_PLAYER_AGE_DAYS)
  const minBuildingTimestamp = getMidnightXDaysEarlier(now, poweruser.MAX_BUILDING_AGE_DAYS)
  const minWorkshopTimestamp = getMidnightXDaysEarlier(now, poweruser.MAX_WORKSHOP_AGE_DAYS)

  const player = playerTimestamp! > minPlayerTimestamp && information.player ? information.player : {name: '???'}

  const karma = domainStats?.karma
  const nextAllianceAttack = nextBattleTimestamp(battleSoloTimestamp, battleAllianceTimestamp, karma).alliance

  return {
    id: userId,
    player: player.name,
    alliance: player.alliance,
    isPoweruser: poweruser.isPoweruser(userId),
    lastUpdate: listEntry.lastUpdate,
    nextAllianceAttack,
    barracks: buildingsTimestamp! > minBuildingTimestamp && information.buildings ? information.buildings.barracks : undefined,
    trebuchet: workshopTimestamp! > minWorkshopTimestamp && information.workshop ? information.workshop.trebuchet : undefined
  }
}

function createEntryString(information: EntryInformation, now: number): string {
  const {barracks, trebuchet} = information
  const parts = []
  parts.push(`${barracks === undefined ? '?' : barracks}${emoji.barracks}`)

  if (trebuchet) {
    parts.push(`${trebuchet}${emoji.trebuchet}`)
  }

  const updateAgo = now - information.lastUpdate
  if (updateAgo > lists.PARTICIPANT_MAX_AGE * (2 / 3)) {
    parts.push(emoji.aged)
  } else if (updateAgo > lists.PARTICIPANT_MAX_AGE * (1 / 3)) {
    parts.push(emoji.aging)
  }

  if (information.isPoweruser) {
    parts.push(emoji.poweruser)
  }

  parts.push(createPlayerMarkdownLink(information.id, information))

  const secondsUntilNextAllianceAttack = information.nextAllianceAttack - now
  if (secondsUntilNextAllianceAttack > 0) {
    parts.push(formatTimeAmount(secondsUntilNextAllianceAttack / 60))
  }

  return parts.join(' ')
}
