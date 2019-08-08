import {BattleAlliance} from 'bastion-siege-logic'
import {Extra} from 'telegraf'

import {War, WarInlineMessage} from '../types'

import {sortBy} from '../javascript-abstraction/array'

import {createWarStats} from '../user-interface/war-stats'

import InMemoryFromSingleFileCache from './in-memory-from-single-file-cache'

const cache = new InMemoryFromSingleFileCache<War[]>('tmp/wars.json', [])

const MAX_BATTLE_AGE = 60 * 12 // 12 minutes

let telegram: any
export function init(tg: any): void {
  telegram = tg
}

async function add(timestamp: number, battle: BattleAlliance): Promise<void> {
  const inlineMessagesToUpdate = addInternal(timestamp, battle)
  cache.save()

  await Promise.all(
    inlineMessagesToUpdate.map(inlineMessage => updateInlineMessage(timestamp, battle, inlineMessage))
  )
}

async function updateInlineMessage(timestamp: number, battle: BattleAlliance, inlineMessage: WarInlineMessage): Promise<void> {
  const {inlineMessageId, player} = inlineMessage
  try {
    await telegram.editMessageText(undefined, undefined, inlineMessageId, createWarStats(timestamp, battle, player), Extra.markdown())
  } catch (error) {
    if (error.message.startsWith('400: Bad Request: message is not modified')) {
      return
    }

    throw error
  }
}

function addInternal(timestamp: number, battle: BattleAlliance, initial = {}): readonly WarInlineMessage[] {
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

export function getCurrent(currentTimestamp: number, playername: string): War {
  return cache.data
    .filter(o => o.beginTimestamp > currentTimestamp - MAX_BATTLE_AGE)
    .filter(({battle}) => battle.attack.includes(playername) || battle.defence.includes(playername))
    .sort(sortBy(o => o.timestamp, true))[0]
}

export function addInlineMessageToUpdate(currentTimestamp: number, player: {name: string; alliance: string}, inlineMessageId: string) {
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
