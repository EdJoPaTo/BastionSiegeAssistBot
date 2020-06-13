import {Castle, CASTLE_SIEGE_SECONDS, CASTLE_HOLD_SECONDS} from 'bastion-siege-logic'
import {KeyValueInMemoryFile} from '@edjopato/datastore'

import {CastleInfo} from '../types/castle-siege'

const data = new KeyValueInMemoryFile<CastleInfo>('persist/castles.json')
function getOrDefault(castle: Castle): CastleInfo {
  return data.get(castle) ?? {
    nextSiege: undefined
  }
}

export async function siegeEnded(castle: Castle, siegeEndedIngameTimestamp: number, newKeeperAlliance: string | undefined): Promise<void> {
  const current = getOrDefault(castle)

  const nextSiegeAvailableTimestamp = siegeEndedIngameTimestamp + CASTLE_HOLD_SECONDS
  const currentIsOld = !current.nextSiege || current.nextSiege < nextSiegeAvailableTimestamp
  const currentKeeperIsUnknown = !current.keeperAlliance && newKeeperAlliance && current.nextSiege === nextSiegeAvailableTimestamp

  if (currentIsOld || currentKeeperIsUnknown) {
    await data.set(castle, {
      keeperAlliance: newKeeperAlliance,
      nextSiege: nextSiegeAvailableTimestamp
    })
  }
}

export function nextSiegeAvailable(castle: Castle): number {
  return getOrDefault(castle).nextSiege ?? Number.NaN
}

export function nextSiegeBeginsFight(castle: Castle): number {
  return nextSiegeAvailable(castle) + CASTLE_SIEGE_SECONDS
}

export function isCurrentlySiegeAvailable(castle: Castle, now: number): boolean {
  const siegeAvailable = nextSiegeAvailable(castle)
  return now > siegeAvailable || !Number.isFinite(siegeAvailable)
}

export function currentKeeperAlliance(castle: Castle): string | undefined {
  return getOrDefault(castle).keeperAlliance
}
