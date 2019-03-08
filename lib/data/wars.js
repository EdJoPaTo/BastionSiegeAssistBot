const {writeFileSync, readFileSync} = require('fs')

const stringify = require('json-stable-stringify')
const {Extra} = require('telegraf')

const {sortBy} = require('../javascript-abstraction/array')

const {createWarStats} = require('../user-interface/war-stats')

const FILE = 'persist/wars.json'
const MAX_BATTLE_AGE = 60 * 10 // 10 minutes

let wars = []
let telegram
load()

function init(tg) {
  telegram = tg
}

function load() {
  try {
    const content = JSON.parse(readFileSync(FILE))
    for (const o of content) {
      addInternal(o.timestamp, o.battle, o)
    }
  } catch (error) {
    // Also errors when file does not exist yet which is not a problem
    console.error('failed to load wars', error)
  }
}

function save() {
  writeFileSync(FILE, stringify(wars, {space: 2}) + '\n', 'utf8')
}

async function add(timestamp, battle) {
  const inlineMessagesToUpdate = addInternal(timestamp, battle)
  save()

  return Promise.all(inlineMessagesToUpdate.map(({inlineMessageId, player}) =>
    telegram.editMessageText(undefined, undefined, inlineMessageId, createWarStats(timestamp, battle, player), Extra.markdown())
      .catch(error => {
        if (error.message === '400: Bad Request: message is not modified') {
          return
        }

        console.error('could not update war', error)
      })
  ))
}

function addInternal(timestamp, battle, initial = {}) {
  const replaces = wars
    .filter(o => o.battle.attack[0] === battle.attack[0] && o.battle.defence[0] === battle.defence[0])[0]

  if (!replaces) {
    wars.push({
      inlineMessages: [],
      ...initial,
      battle,
      timestamp
    })
  } else if (replaces.timestamp < timestamp) {
    replaces.battle = battle
    replaces.timestamp = timestamp
  }

  wars = wars
    .filter(o => o.timestamp > timestamp - MAX_BATTLE_AGE)

  return (replaces || {}).inlineMessages || []
}

function getCurrent(currentTimestamp, playername) {
  return wars
    .filter(o => o.timestamp > currentTimestamp - MAX_BATTLE_AGE)
    .filter(({battle}) => battle.attack.includes(playername) || battle.defence.includes(playername))
    .sort(sortBy(o => o.timestamp, true))[0]
}

function addInlineMessageToUpdate(currentTimestamp, player, inlineMessageId) {
  const entry = getCurrent(currentTimestamp, player.name)
  entry.inlineMessages.push({
    inlineMessageId,
    player
  })
  save()
}

module.exports = {
  add,
  addInlineMessageToUpdate,
  getCurrent,
  init
}
