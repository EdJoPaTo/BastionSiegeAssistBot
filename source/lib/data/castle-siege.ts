import {CASTLE_SIEGE_SECONDS, Castle} from 'bastion-siege-logic'
import {RawObjectInMemoryFile} from '@edjopato/datastore'
import arrayFilterUnique from 'array-filter-unique'

import {CastleSiegeEntry, CastleSiegePlayerEntry} from '../types'

import {sortBy} from '../javascript-abstraction/array'

const data = new RawObjectInMemoryFile<CastleSiegeEntry[]>('tmp/castle-siege.json')

export const MAXIMUM_JOIN_SECONDS = CASTLE_SIEGE_SECONDS

export async function add(castle: Castle, alliance: string, player: string | undefined, timestamp: number): Promise<void> {
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

export function getAlliances(castle: Castle, currentTimestamp: number): readonly string[] {
  return (data.get() || [])
    .filter(o => o.castle === castle && o.timestamp > currentTimestamp - MAXIMUM_JOIN_SECONDS)
    .sort(sortBy(o => o.timestamp))
    .map(o => o.alliance)
    .filter(arrayFilterUnique())
}

export function getParticipants(castle: Castle, alliance: string, currentTimestamp: number): readonly CastleSiegePlayerEntry[] {
  const minTimestamp = currentTimestamp - MAXIMUM_JOIN_SECONDS

  // Joined alliances have no player
  const onlyPlayerEntries: CastleSiegePlayerEntry[] = (data.get() || [])
    .filter(o => o.player) as CastleSiegePlayerEntry[]

  return onlyPlayerEntries
    .filter(o => o.castle === castle)
    .filter(o => o.timestamp > minTimestamp)
    .filter(o => o.alliance === alliance)
    .sort(sortBy(o => o.timestamp))
}
