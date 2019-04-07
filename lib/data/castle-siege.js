const {sortBy} = require('../javascript-abstraction/array')

const InMemoryFromSingleFileCache = require('./in-memory-from-single-file-cache')

const cache = new InMemoryFromSingleFileCache('persist/castle-siege.json', [])

const MAXIMUM_JOIN_MINUTES = 60 * 5 // 5 hours
const MAXIMUM_JOIN_SECONDS = 60 * MAXIMUM_JOIN_MINUTES

function add(timestamp, alliance, player) {
  cache.data = cache.data
    .filter(o => o.timestamp > timestamp - MAXIMUM_JOIN_SECONDS)
    .filter(o => o.player !== player)

  cache.data.push({
    timestamp,
    alliance,
    player
  })

  cache.save()
}

function getParticipants(currentTimestamp, alliance) {
  return cache.data
    .filter(o => o.timestamp > currentTimestamp - MAXIMUM_JOIN_SECONDS)
    .filter(o => o.alliance === alliance)
    .sort(sortBy(o => o.timestamp))
}

module.exports = {
  MAXIMUM_JOIN_MINUTES,
  MAXIMUM_JOIN_SECONDS,
  add,
  getParticipants
}
