const {Extra} = require('telegraf')

const {sortBy} = require('../javascript-abstraction/array')

const {createWarStats} = require('../user-interface/war-stats')

const InMemoryFromSingleFileCache = require('./in-memory-from-single-file-cache')

const cache = new InMemoryFromSingleFileCache('persist/wars.json', [])

const MAX_BATTLE_AGE = 60 * 12 // 12 minutes

let telegram
function init(tg) {
  telegram = tg
}

async function add(timestamp, battle) {
  const inlineMessagesToUpdate = addInternal(timestamp, battle)
  cache.save()

  return Promise.all(
    inlineMessagesToUpdate.map(inlineMessage => updateInlineMessage(timestamp, battle, inlineMessage))
  )
}

async function updateInlineMessage(timestamp, battle, inlineMessage) {
  const {inlineMessageId, player} = inlineMessage
  try {
    await telegram.editMessageText(undefined, undefined, inlineMessageId, createWarStats(timestamp, battle, player), Extra.markdown())
  } catch (error) {
    if (error.message === '400: Bad Request: message is not modified') {
      return
    }

    throw error
  }
}

function addInternal(timestamp, battle, initial = {}) {
  const replaces = cache.data
    .filter(o => o.battle.attack[0] === battle.attack[0] && o.battle.defence[0] === battle.defence[0])[0]

  if (!replaces) {
    cache.data.push({
      inlineMessages: [],
      ...initial,
      battle,
      beginTimestamp: timestamp,
      timestamp
    })
  } else if (timestamp > replaces.timestamp) {
    replaces.battle = battle
    replaces.timestamp = timestamp
  } else if (timestamp < replaces.beginTimestamp) {
    replaces.beginTimestamp = timestamp
  }

  cache.data = cache.data
    .filter(o => o.beginTimestamp > timestamp - MAX_BATTLE_AGE)

  return (replaces || {}).inlineMessages || []
}

function getCurrent(currentTimestamp, playername) {
  return cache.data
    .filter(o => o.beginTimestamp > currentTimestamp - MAX_BATTLE_AGE)
    .filter(({battle}) => battle.attack.includes(playername) || battle.defence.includes(playername))
    .sort(sortBy(o => o.timestamp, true))[0]
}

function addInlineMessageToUpdate(currentTimestamp, player, inlineMessageId) {
  const entry = getCurrent(currentTimestamp, player.name)
  entry.inlineMessages.push({
    inlineMessageId,
    player
  })
  cache.save()
}

module.exports = {
  add,
  addInlineMessageToUpdate,
  getCurrent,
  init
}
