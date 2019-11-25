import {Castle, CASTLE_SIEGE_SECONDS, CASTLE_HOLD_SECONDS} from 'bastion-siege-logic'
import {KeyValueInMemoryFile} from '@edjopato/datastore'

import {CastleInfo} from '../types/castle-siege'

const data = new KeyValueInMemoryFile<CastleInfo>('persist/castles.json')
function getOrDefault(castle: Castle): CastleInfo {
  return data.get(castle) || {
    nextSiege: undefined
  }
}

export async function siegeEnded(castle: Castle, siegeEndedIngameTimestamp: number): Promise<void> {
  const current = getOrDefault(castle)

  const nextSiegeAvailableTimestamp = siegeEndedIngameTimestamp + CASTLE_HOLD_SECONDS

  if (!current.nextSiege || current.nextSiege < nextSiegeAvailableTimestamp) {
    current.nextSiege = nextSiegeAvailableTimestamp
    await data.set(castle, current)
  }
}

export function nextSiegeAvailable(castle: Castle): number {
  return getOrDefault(castle).nextSiege || NaN
}

export function nextSiegeBeginsFight(castle: Castle): number {
  return nextSiegeAvailable(castle) + CASTLE_SIEGE_SECONDS
}

export function isCurrentlySiegeAvailable(castle: Castle, now: number): boolean {
  const siegeAvailable = nextSiegeAvailable(castle)
  return now > siegeAvailable && now < siegeAvailable + CASTLE_SIEGE_SECONDS
}
