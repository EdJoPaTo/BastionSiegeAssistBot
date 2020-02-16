import {BattleAlliance} from 'bastion-siege-logic'
import {Extra, Telegram} from 'telegraf'
import {RawObjectInMemoryFile} from '@edjopato/datastore'

import {War, WarInlineMessage} from '../types'

import {sortBy} from '../javascript-abstraction/array'

import {createWarStats} from '../user-interface/war-stats'

const data = new RawObjectInMemoryFile<War[]>('tmp/wars.json')

const MAX_BATTLE_AGE = 60 * 12 // 12 minutes

let telegram: Telegram
export function init(tg: Telegram): void {
  telegram = tg
}

export async function add(timestamp: number, battle: BattleAlliance): Promise<void> {
  const inlineMessagesToUpdate = await addInternal(timestamp, battle)
  await Promise.all(
    inlineMessagesToUpdate.map(async inlineMessage => updateInlineMessage(timestamp, battle, inlineMessage))
  )
}

async function updateInlineMessage(timestamp: number, battle: BattleAlliance, inlineMessage: WarInlineMessage): Promise<void> {
  const {inlineMessageId, player} = inlineMessage
  try {
    await telegram.editMessageText(undefined, undefined, inlineMessageId, createWarStats(timestamp, battle, player), Extra.markdown() as any)
  } catch (error) {
    if (error.message.startsWith('400: Bad Request: message is not modified') ||
      error.message.includes('400: Bad Request: MESSAGE_ID_INVALID')
    ) {
      return
    }

    throw error
  }
}

async function addInternal(timestamp: number, battle: BattleAlliance, initial = {}): Promise<readonly WarInlineMessage[]> {
  const content = data.get() || []

  const replaces: War | undefined = content
    .filter(o => o.battle.attack[0] === battle.attack[0] && o.battle.defence[0] === battle.defence[0])[0]

  if (!replaces) {
    content.push({
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

  const cleanedUp = content
    .filter(o => o.beginTimestamp > timestamp - MAX_BATTLE_AGE)

  await data.set(cleanedUp)
  return (replaces || {}).inlineMessages || []
}

export function getCurrent(currentTimestamp: number, playername: string): War | undefined {
  return getCurrentInternal(currentTimestamp, playername).relevant
}

function getCurrentInternal(currentTimestamp: number, playername: string): {all: War[]; relevant: War | undefined} {
  const all = data.get() || []
  const relevant = all
    .filter(o => o.beginTimestamp > currentTimestamp - MAX_BATTLE_AGE)
    .filter(({battle}) => battle.attack.includes(playername) || battle.defence.includes(playername))
    .sort(sortBy(o => o.timestamp, true))

  return {all, relevant: relevant[0]}
}

export async function addInlineMessageToUpdate(currentTimestamp: number, player: {name: string; alliance: string}, inlineMessageId: string): Promise<void> {
  const {all, relevant} = getCurrentInternal(currentTimestamp, player.name)
  if (!relevant) {
    throw new Error('there is no war to update')
  }

  relevant.inlineMessages.push({
    inlineMessageId,
    player
  })

  await data.set(all)
}
