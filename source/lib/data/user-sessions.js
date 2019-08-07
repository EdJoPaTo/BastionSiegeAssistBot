const LocalSession = require('telegraf-session-local')
const stringify = require('json-stable-stringify')

const {sortBy} = require('../javascript-abstraction/array')

const localSession = new LocalSession({
  // Database name/path, where sessions will be located (default: 'sessions.json')
  database: 'persist/sessions.json',
  // Format of storage/database (default: JSON.stringify / JSON.parse)
  format: {
    serialize: obj => stringify(obj, {space: 2}) + '\n',
    deserialize: str => JSON.parse(str)
  },
  getSessionKey: ctx => `${ctx.from.id}:${ctx.from.id}`
})

function getRaw() {
  return localSession.DB
    .get('sessions').value()
    .map(({id, data}) => {
      const user = Number(id.split(':')[0])
      return {user, data}
    })
}

function getUser(userId) {
  return localSession.DB
    .get('sessions')
    .getById(`${userId}:${userId}`)
    .get('data')
    .value() || {}
}

let playernameCache = {}
let playernameCacheAge = 0
const PLAYERNAME_CACHE_MAX_AGE = 30 * 1000 // 30 seconds

function updatePlayernameCache() {
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
    const {name} = add.data.gameInformation.player
    if (!coll[name]) {
      coll[name] = []
    }

    coll[name].push(add)
    return coll
  }, {})

  playernameCacheAge = Date.now()
  playernameCache = {}
  for (const name of Object.keys(groupedByName)) {
    const entries = groupedByName[name]
      .sort(sortBy(o => o.data.gameInformation.playerTimestamp, true))

    playernameCache[name] = entries[0].user
  }
}

function getUserIdByName(playername) {
  updatePlayernameCache()
  return playernameCache[playername]
}

module.exports = {
  getRaw,
  getUser,
  getUserIdByName,
  middleware: () => localSession.middleware()
}
