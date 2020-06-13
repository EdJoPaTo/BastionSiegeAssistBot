import {KeyValueInMemoryFiles} from '@edjopato/datastore'
import arrayFilterUnique from 'array-filter-unique'
import stringify from 'json-stable-stringify'

import {PlayerHistory, PlayerHistoryEntry, PlayerHistoryLatest} from '../types/player-history'

const KEEP_ONLY_LATEST = new Set(['effects', 'resources'])

console.time('player history')
const playerData = new KeyValueInMemoryFiles<PlayerHistory>('persist/player-history')
console.timeEnd('player history')

export async function add(userId: number, type: keyof PlayerHistory, unixTimestamp: number, data: any): Promise<void> {
  const current = get(userId)

  if (type === 'player') {
    data = {
      ...data
    }
    delete data.achievements
    delete data.bonus
  }

  const checkForKnown = [
    ...(current[type] as Array<PlayerHistoryEntry<unknown>>)
      .slice(-2)
      .map((o: PlayerHistoryEntry<unknown>) => o.data),
    data
  ]

  const different = checkForKnown
    .map(o => stringify(o))
    .filter(arrayFilterUnique())
    .length

  if (KEEP_ONLY_LATEST.has(type) && current[type].length > 0) {
    current[type][0] = {
      timestamp: unixTimestamp,
      data
    }
  } else if (checkForKnown.length === 3 && different === 1) {
    // Both last values are the same so just update the timestamp of the last
    const lastIndex = current[type].length - 1
    current[type][lastIndex] = {
      ...current[type][lastIndex],
      timestamp: unixTimestamp
    }
  } else {
    // New
    current[type].push({
      timestamp: unixTimestamp,
      data
    })
  }

  await playerData.set(String(userId), current)
}

export function get(userId: number): PlayerHistory {
  const current = playerData.get(String(userId))
  return {
    buildings: current?.buildings ?? [],
    domainStats: current?.domainStats ?? [],
    effects: current?.effects ?? [],
    player: current?.player ?? [],
    resources: current?.resources ?? [],
    workshop: current?.workshop ?? []
  }
}

export function getLatest(userId: number): PlayerHistoryLatest {
  const current = get(userId)
  return {
    buildings: current.buildings.slice(-1)[0],
    domainStats: current.domainStats.slice(-1)[0],
    effects: current.effects.slice(-1)[0],
    player: current.player.slice(-1)[0],
    resources: current.resources.slice(-1)[0],
    workshop: current.workshop.slice(-1)[0]
  }
}

function getAsUnknown(playerHistory: PlayerHistory, type: keyof PlayerHistory): Array<PlayerHistoryEntry<unknown>> {
  return playerHistory[type]
}

export function getAllTimestamps<Key extends keyof PlayerHistory>(userId: number, type: Key): PlayerHistory[Key] {
  return get(userId)[type]
}

export function getLastTimeActive(userId: number): number {
  const data = get(userId)
  const keys = Object.keys(data) as Array<keyof PlayerHistory>
  const lastTimestamps = keys
    .flatMap(o => getAsUnknown(data, o).slice(-1))
    .map(o => o.timestamp)

  return Math.max(...lastTimestamps)
}
