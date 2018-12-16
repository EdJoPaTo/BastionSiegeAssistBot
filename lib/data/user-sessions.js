const LocalSession = require('telegraf-session-local')
const stringify = require('json-stable-stringify')

const localSession = new LocalSession({
  // Database name/path, where sessions will be located (default: 'sessions.json')
  database: 'persist/sessions.json',
  // Format of storage/database (default: JSON.stringify / JSON.parse)
  format: {
    serialize: obj => stringify(obj, {space: 2}) + '\n',
    deserialize: str => JSON.parse(str)
  }
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
  const arr = getRaw()
    .filter(o => o.user === userId)
    .map(o => o.data)
  return arr[0] || {}
}

module.exports = {
  getRaw,
  getUser,
  middleware: () => localSession.middleware()
}
