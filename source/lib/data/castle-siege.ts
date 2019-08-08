import arrayFilterUnique from 'array-filter-unique'

import {CastleSiegeEntry} from '../types'

import {sortBy} from '../javascript-abstraction/array'

import InMemoryFromSingleFileCache from './in-memory-from-single-file-cache'

const cache = new InMemoryFromSingleFileCache<CastleSiegeEntry[]>('tmp/castle-siege.json', [])

export const MAXIMUM_JOIN_MINUTES = 60 * 5 // 5 hours
export const MAXIMUM_JOIN_SECONDS = 60 * MAXIMUM_JOIN_MINUTES

export function add(timestamp: number, alliance: string, player: string): void {
  cache.data = cache.data
    .filter(o => o.timestamp > timestamp - MAXIMUM_JOIN_SECONDS)
    .filter(o => o.player !== player || o.alliance !== alliance)

  cache.data.push({
    timestamp,
    alliance,
    player
  })

  cache.save()
}

export function getAlliances(currentTimestamp: number): readonly string[] {
  return cache.data
    .filter(o => o.timestamp > currentTimestamp - MAXIMUM_JOIN_SECONDS)
    .sort(sortBy(o => o.timestamp))
    .map(o => o.alliance)
    .filter(arrayFilterUnique())
}

export function getParticipants(currentTimestamp: number, alliance: string): readonly CastleSiegeEntry[] {
  return cache.data
    .filter(o => o.timestamp > currentTimestamp - MAXIMUM_JOIN_SECONDS)
    .filter(o => o.alliance === alliance)
    .filter(o => o.player) // Joined alliances have no player
    .sort(sortBy(o => o.timestamp))
}

module.exports = {
  MAXIMUM_JOIN_MINUTES,
  MAXIMUM_JOIN_SECONDS,
  add,
  getAlliances,
  getParticipants
}