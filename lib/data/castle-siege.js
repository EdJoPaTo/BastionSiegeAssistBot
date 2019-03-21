const {writeFileSync, readFileSync} = require('fs')

const stringify = require('json-stable-stringify')

const {sortBy} = require('../javascript-abstraction/array')

const FILE = 'persist/castle-siege.json'

const MAXIMUM_JOIN_MINUTES = 60 * 5 // 5 hours
const MAXIMUM_JOIN_SECONDS = 60 * MAXIMUM_JOIN_MINUTES

let participants = []
load()

function load() {
  try {
    const content = JSON.parse(readFileSync(FILE))
    for (const o of content) {
      addInternal(o.timestamp, o.alliance, o.player)
    }
  } catch (error) {
    if (error.code === 'ENOENT') {
      // Simply does not exist yet
      return
    }

    console.error('failed loading', FILE, error)
  }
}

function save() {
  writeFileSync(FILE, stringify(participants, {space: 2}) + '\n', 'utf8')
}

function add(timestamp, alliance, player) {
  addInternal(timestamp, alliance, player)
  save()
}

function addInternal(timestamp, alliance, player) {
  participants = participants
    .filter(o => o.timestamp > timestamp - MAXIMUM_JOIN_SECONDS)
    .filter(o => o.player !== player)

  participants.push({
    timestamp,
    alliance,
    player
  })
}

function getParticipants(currentTimestamp, alliance) {
  return participants
    .filter(o => o.timestamp > currentTimestamp - MAXIMUM_JOIN_SECONDS)
    .filter(o => o.alliance === alliance)
    .sort(sortBy(o => o.timestamp, true))
}

module.exports = {
  MAXIMUM_JOIN_MINUTES,
  MAXIMUM_JOIN_SECONDS,
  add,
  getParticipants
}
