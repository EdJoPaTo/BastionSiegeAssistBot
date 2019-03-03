const {writeFileSync, readFileSync} = require('fs')

const stringify = require('json-stable-stringify')
const arrayFilterUnique = require('array-filter-unique')
const {Extra} = require('telegraf')

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
    for (const {timestamp, battle, inlineMessages} of content) {
      addInternal(timestamp, battle, inlineMessages)
    }
  } catch (error) {
  }
}

function save() {
  writeFileSync(FILE, stringify(wars, {space: 2}) + '\n', 'utf8')
}

async function add(timestamp, battle) {
  const inlineMessagesToUpdate = addInternal(timestamp, battle)
  save()

  return Promise.all(inlineMessagesToUpdate.map(({msgId, isAttack}) =>
    telegram.editMessageText(undefined, undefined, msgId, createWarStats(timestamp, battle, isAttack ? battle.attack[0] : battle.defence[0]), Extra.markdown())
      .catch(() => {})
  ))
}

function addInternal(timestamp, battle, inlineMessages = []) {
  const replaces = wars
    .filter(o => o.battle.attack[0] === battle.attack[0] && o.battle.defence[0] === battle.defence[0])[0]

  const allInlineMessages = [
    ...((replaces || {}).inlineMessages || []),
    ...inlineMessages
  ]
    .filter(arrayFilterUnique(o => o.inlineMessageId))

  wars = wars
    .filter(o => o.timestamp > timestamp - MAX_BATTLE_AGE)
    .filter(o => o.battle.attack[0] !== battle.attack[0] && o.battle.defence[0] !== battle.defence[0])

  wars.push({timestamp, battle, inlineMessages: allInlineMessages})
  return allInlineMessages
}

function getCurrent(currentTimestamp, playername) {
  return wars
    .filter(o => o.timestamp > currentTimestamp - MAX_BATTLE_AGE)
    .filter(({battle}) => battle.attack.includes(playername) || battle.defence.includes(playername))[0]
}

function addInlineMessageToUpdate(currentTimestamp, playername, inlineMessageId) {
  const entry = getCurrent(currentTimestamp, playername)
  const isAttack = entry.battle.attack.includes(playername)
  entry.inlineMessages.push({
    inlineMessageId,
    isAttack
  })
  save()
}

module.exports = {
  add,
  addInlineMessageToUpdate,
  getCurrent,
  init
}
