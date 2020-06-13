import {Context as TelegrafContext} from 'telegraf'
import arrayReduceGroupBy from 'array-reduce-group-by'
import LocalSession from 'telegraf-session-local'

import {DAY_IN_SECONDS} from '../math/timeframe'

import {Session} from '../types'

import {sortBy} from '../javascript-abstraction/array'

import {MAX_PLAYER_AGE_DAYS} from './poweruser'

export interface SessionRaw {
  readonly user: number;
  readonly data: Session;
}

const localSession = new LocalSession({
  // Database name/path, where sessions will be located (default: 'sessions.json')
  database: 'persist/sessions.json',
  // Format of storage/database (default: JSON.stringify / JSON.parse)
  format: {
    serialize: (obj: any) => JSON.stringify(obj, undefined, '\t'),
    deserialize: (str: string) => JSON.parse(str)
  },
  getSessionKey: (ctx: TelegrafContext) => `${ctx.from!.id}:${ctx.from!.id}`
})

export function getRaw(): readonly SessionRaw[] {
  return (localSession.DB as any)
    .get('sessions').value()
    .map(({id, data}: {id: string; data: any}) => {
      const user = Number(id.split(':')[0])
      return {user, data}
    })
}

export function getRawNameTrusted(): SessionRaw[] {
  const minPlayerTimestamp = (Date.now() / 1000) - (MAX_PLAYER_AGE_DAYS * DAY_IN_SECONDS)
  return getRaw()
    .filter(o =>
      o.data.gameInformation?.playerTimestamp &&
      o.data.gameInformation.playerTimestamp > minPlayerTimestamp &&
      o.data.gameInformation.player?.name
    )
}

export function getRawInAlliance(alliance: string): SessionRaw[] {
  if (!alliance) {
    throw new Error('you cant spy on users without alliance')
  }

  return getRawNameTrusted()
    .filter(o => o.data.gameInformation.player!.alliance === alliance)
}

export function getUser(userId: number): Session {
  const fallback: Session = {
    gameInformation: {}
  }

  return (localSession.DB as any)
    .get('sessions')
    .getById(`${userId}:${userId}`)
    .get('data')
    .value() || fallback
}

let playernameCache: Record<string, number> = {}
let playernameCacheAge = 0
const PLAYERNAME_CACHE_MAX_AGE = 30 * 1000 // 30 seconds

function updatePlayernameCache(): void {
  const minCacheAge = Date.now() - PLAYERNAME_CACHE_MAX_AGE
  if (playernameCacheAge > minCacheAge) {
    return
  }

  const raw = getRawNameTrusted()
  const groupedByName = raw.reduce(arrayReduceGroupBy(o => o.data.gameInformation.player!.name), {})

  playernameCacheAge = Date.now()
  playernameCache = {}
  for (const name of Object.keys(groupedByName)) {
    const entries = groupedByName[name]
      .sort(sortBy(o => o.data.gameInformation.playerTimestamp || 0, true))

    playernameCache[name] = entries[0].user
  }
}

export function getUserIdByName(playername: string): number | undefined {
  updatePlayernameCache()
  return playernameCache[playername]
}

export const middleware = (): any => localSession.middleware()
