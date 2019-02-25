const {writeFileSync, readFileSync, mkdirSync, readdirSync} = require('fs')

const arrayFilterUnique = require('array-filter-unique')
const stringify = require('json-stable-stringify')

const FOLDER = 'persist/player-history/'
mkdirSync(FOLDER, {recursive: true})

const playerData = load()

function load() {
  try {
    const userIds = readdirSync(FOLDER)
      .map(o => o.replace('.json', ''))

    const result = {}
    for (const id of userIds) {
      const content = loadUser(id)
      result[id] = content
    }

    return result
  } catch (error) {
    return {}
  }
}

function loadUser(userId) {
  const file = `${FOLDER}${userId}.json`
  try {
    return JSON.parse(readFileSync(file, 'utf8'))
  } catch (error) {
    return {}
  }
}

function save(userId) {
  const file = `${FOLDER}${userId}.json`
  const content = stringify(playerData[userId], {space: 2}) + '\n'
  writeFileSync(file, content, 'utf8')
}

function add(userId, type, unixTimestamp, data) {
  if (!playerData[userId]) {
    playerData[userId] = {}
  }

  if (!playerData[userId][type]) {
    playerData[userId][type] = []
  }

  const checkForKnown = [
    ...playerData[userId][type]
      .slice(-2)
      .map(o => o.data),
    data
  ]

  const different = checkForKnown
    .map(o => stringify(o))
    .filter(arrayFilterUnique())
    .length

  if (checkForKnown.length === 3 && different === 1) {
    // Both last values are the same so just update the timestamp of the last
    const lastIndex = playerData[userId][type].length - 1
    playerData[userId][type][lastIndex].timestamp = unixTimestamp
  } else {
    // New
    playerData[userId][type].push({
      timestamp: unixTimestamp,
      data
    })
  }

  save(userId)
}

function getAllTimestamps(userId, type) {
  if (!playerData[userId] || !playerData[userId][type]) {
    return []
  }

  return playerData[userId][type]
}

function getLastTimestamp(userId, type) {
  return getAllTimestamps(userId, type).slice(-1)[0]
}

function getLastTimeActive(userId) {
  if (!playerData[userId]) {
    return -Infinity
  }

  const keys = Object.keys(playerData[userId])
  const lastTimestamps = keys
    .flatMap(o => playerData[userId][o].slice(-1))
    .map(o => o.timestamp)

  return Math.max(...lastTimestamps)
}

module.exports = {
  add,
  getAllTimestamps,
  getLastTimestamp,
  getLastTimeActive
}