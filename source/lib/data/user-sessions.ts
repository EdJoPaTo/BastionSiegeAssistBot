import {ContextMessageUpdate} from 'telegraf'
import arrayReduceGroupBy from 'array-reduce-group-by'

import {DAY_IN_SECONDS} from '../math/timeframe'

import {Session} from '../types'

import {sortBy} from '../javascript-abstraction/array'

import {MAX_PLAYER_AGE_DAYS} from './poweruser'

/* eslint @typescript-eslint/no-var-requires: warn */
const LocalSession = require('telegraf-session-local')

export interface SessionRaw {
  user: number;
  data: Session;
}

const localSession = new LocalSession({
  // Database name/path, where sessions will be located (default: 'sessions.json')
  database: 'persist/sessions.json',
  // Format of storage/database (default: JSON.stringify / JSON.parse)
  format: {
    serialize: (obj: any) => JSON.stringify(obj, undefined, '\t'),
    deserialize: (str: string) => JSON.parse(str)
  },
  getSessionKey: (ctx: ContextMessageUpdate) => `${ctx.from!.id}:${ctx.from!.id}`
})

export function getRaw(): readonly SessionRaw[] {
  return localSession.DB
    .get('sessions').value()
    .map(({id, data}: {id: string; data: any}) => {
      const user = Number(id.split(':')[0])
      return {user, data}
    })
}

export function getUser(userId: number): Session {
  const fallback: Session = {
    gameInformation: {}
  }

  return localSession.DB
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

  const minPlayerTimestamp = (Date.now() / 1000) - (MAX_PLAYER_AGE_DAYS * DAY_IN_SECONDS)

  const raw = getRaw()
    .filter(o =>
      o.data.gameInformation &&
      o.data.gameInformation.playerTimestamp &&
      o.data.gameInformation.playerTimestamp > minPlayerTimestamp &&
      o.data.gameInformation.player &&
      o.data.gameInformation.player.name
    )

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
