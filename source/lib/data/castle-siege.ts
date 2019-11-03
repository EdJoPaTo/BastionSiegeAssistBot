import {RawObjectInMemoryFile} from '@edjopato/datastore'
import arrayFilterUnique from 'array-filter-unique'

import {CastleSiegeEntry, CastleSiegePlayerEntry} from '../types'

import {sortBy} from '../javascript-abstraction/array'

const data = new RawObjectInMemoryFile<CastleSiegeEntry[]>('tmp/castle-siege.json')

export const MAXIMUM_JOIN_MINUTES = 60 * 5 // 5 hours
export const MAXIMUM_JOIN_SECONDS = 60 * MAXIMUM_JOIN_MINUTES

export async function add(timestamp: number, alliance: string, player: string | undefined): Promise<void> {
  if (!alliance) {
    throw new Error('Its not possible to join the castle siege without an alliance.')
  }

  const all = data.get() || []

  const filtered = all
    .filter(o => o.timestamp > timestamp - MAXIMUM_JOIN_SECONDS)
    .filter(o => o.player !== player || o.alliance !== alliance)

  filtered.push({
    timestamp,
    alliance,
    player
  })

  await data.set(filtered)
}

export function getAlliances(currentTimestamp: number): readonly string[] {
  return (data.get() || [])
    .filter(o => o.timestamp > currentTimestamp - MAXIMUM_JOIN_SECONDS)
    .sort(sortBy(o => o.timestamp))
    .map(o => o.alliance)
    .filter(arrayFilterUnique())
}

export function getParticipants(currentTimestamp: number, alliance: string): readonly CastleSiegePlayerEntry[] {
  // Joined alliances have no player
  const onlyPlayerEntries: CastleSiegePlayerEntry[] = (data.get() || [])
    .filter(o => o.player) as CastleSiegePlayerEntry[]

  return onlyPlayerEntries
    .filter(o => o.timestamp > currentTimestamp - MAXIMUM_JOIN_SECONDS)
    .filter(o => o.alliance === alliance)
    .sort(sortBy(o => o.timestamp))
}
