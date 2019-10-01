import stringify from 'json-stable-stringify'

import {Session} from '../types'

import {sortBy} from '../javascript-abstraction/array'

/* eslint @typescript-eslint/no-var-requires: warn */
const LocalSession = require('telegraf-session-local')

type Dictionary<T> = {[key: string]: T}

export interface SessionRaw {
  user: number;
  data: Session;
}

const localSession = new LocalSession({
  // Database name/path, where sessions will be located (default: 'sessions.json')
  database: 'persist/sessions.json',
  // Format of storage/database (default: JSON.stringify / JSON.parse)
  format: {
    serialize: (obj: any) => stringify(obj, {space: 2}) + '\n',
    deserialize: (str: string) => JSON.parse(str)
  },
  getSessionKey: (ctx: any) => `${ctx.from.id}:${ctx.from.id}`
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
  return localSession.DB
    .get('sessions')
    .getById(`${userId}:${userId}`)
    .get('data')
    .value() || {}
}

let playernameCache: Dictionary<number> = {}
let playernameCacheAge = 0
const PLAYERNAME_CACHE_MAX_AGE = 30 * 1000 // 30 seconds

function updatePlayernameCache(): void {
  const minAge = Date.now() - PLAYERNAME_CACHE_MAX_AGE
  if (playernameCacheAge > minAge) {
    return
  }

  const raw = getRaw()
    .filter(o =>
      o.data.gameInformation &&
      o.data.gameInformation.playerTimestamp &&
      o.data.gameInformation.player &&
      o.data.gameInformation.player.name
    )

  const groupedByName = raw.reduce((coll, add) => {
    const {name} = add.data.gameInformation.player!
    if (!coll[name]) {
      coll[name] = []
    }

    coll[name].push(add)
    return coll
  }, {} as Dictionary<SessionRaw[]>)

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

module.exports = {
  getRaw,
  getUser,
  getUserIdByName,
  middleware: () => localSession.middleware()
}
