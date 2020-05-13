import {CASTLE_SIEGE_SECONDS, Castle} from 'bastion-siege-logic'
import {RawObjectInMemoryFile} from '@edjopato/datastore'
import {Telegram, Extra} from 'telegraf'
import arrayFilterUnique from 'array-filter-unique'

import {CastleSiegeEntry, CastleSiegePlayerEntry, CastleSiegeInlineMessage} from '../types'

import {sortBy} from '../javascript-abstraction/array'

import {castlePart} from '../user-interface/castle-siege'

type UnixTimestamp = number

const data = new RawObjectInMemoryFile<CastleSiegeEntry[]>('tmp/castle-siege.json')
const inlineMessages = new RawObjectInMemoryFile<CastleSiegeInlineMessage[]>('tmp/castle-siege-inline-messages.json')

export const MAXIMUM_JOIN_SECONDS = CASTLE_SIEGE_SECONDS

let telegram: Telegram
export function init(tg: Telegram): void {
  telegram = tg
}

export async function add(castle: Castle, alliance: string, player: string | undefined, timestamp: UnixTimestamp): Promise<void> {
  if (!alliance) {
    throw new Error('Its not possible to join the castle siege without an alliance.')
  }

  const all = data.get() || []

  const filtered = all
    .filter(o => o.timestamp > timestamp - MAXIMUM_JOIN_SECONDS)
    .filter(o => o.castle !== castle || o.player !== player || o.alliance !== alliance)

  filtered.push({
    timestamp,
    castle,
    alliance,
    player
  })

  await data.set(filtered)
}

export function getAlliances(castle: Castle, sinceTimestamp: number): readonly string[] {
  return (data.get() || [])
    .filter(o => o.castle === castle && o.timestamp > sinceTimestamp)
    .sort(sortBy(o => o.timestamp))
    .map(o => o.alliance)
    .filter(arrayFilterUnique())
}

export function getParticipants(castle: Castle, alliance: string, sinceTimestamp: UnixTimestamp): readonly CastleSiegePlayerEntry[] {
  // Joined alliances have no player
  const onlyPlayerEntries: CastleSiegePlayerEntry[] = (data.get() || [])
    .filter((o): o is CastleSiegePlayerEntry => Boolean(o.player))

  return onlyPlayerEntries
    .filter(o => o.castle === castle)
    .filter(o => o.timestamp > sinceTimestamp)
    .filter(o => o.alliance === alliance)
    .sort(sortBy(o => o.timestamp))
}

export function getCastlesAllianceIsParticipatingInRecently(alliance: string, currentTimestamp: UnixTimestamp): Castle[] {
  if (!alliance) {
    throw new Error('you cant participate at a siege without alliance')
  }

  const minTimestamp = currentTimestamp - MAXIMUM_JOIN_SECONDS
  const participatingInCastle = (data.get() ?? [])
    .filter(o => o.timestamp > minTimestamp)
    .filter(o => o.alliance === alliance)
    .sort(sortBy(o => o.timestamp))
    .map(o => o.castle)
    .filter(arrayFilterUnique())
    .reverse()

  return participatingInCastle
}

export async function updateInlineMessages(castle: Castle, onlyForAlliance: string | undefined, now: UnixTimestamp): Promise<void> {
  const all = inlineMessages.get() ?? []
  const filtered = all
    .filter(o => o.castle === castle)
    .filter(o => onlyForAlliance ? o.alliance === onlyForAlliance : true)

  await Promise.all(filtered
    .map(async o => {
      const text = castlePart(o.castle, {
        now,
        userAlliance: o.alliance,
        userIsPoweruser: true
      })
      await telegram.editMessageText(undefined, undefined, o.inlineMessageId, text, Extra.markdown() as any)
        .catch(error => {
          if (error instanceof Error && (
            error.message.includes('message is not modified') ||
            error.message.includes('MESSAGE_ID_INVALID')
          )) {
            return
          }

          throw error
        })
    })
  )
}

export async function addInlineMessage(inlineMessageId: string, castle: Castle, alliance: string, now: UnixTimestamp): Promise<void> {
  if (!alliance) {
    throw new Error('you need an alliance for that')
  }

  const all = inlineMessages.get() ?? []
  if (all.some(o => o.inlineMessageId === inlineMessageId)) {
    throw new Error('The inline message is already automatically updated')
  }

  all.push({
    castle,
    alliance,
    inlineMessageId,
    timestamp: now
  })

  const minTimestamp = now - MAXIMUM_JOIN_SECONDS
  const withoutOld = all
    .filter(o => o.timestamp > minTimestamp)
  await inlineMessages.set(withoutOld)
  await updateInlineMessages(castle, alliance, now)
}
