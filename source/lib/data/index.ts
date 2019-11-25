import {readFileSync, existsSync, unlinkSync, rmdirSync} from 'fs'

import {parseGamescreenContent} from 'bastion-siege-logic'

import {FailedBSMessage} from '../types'

import {loadAll} from './ingame/many-files-store'
import {tryRemoveFailed} from './ingame/failed-bs-messages'
import * as attackscouts from './ingame/attackscouts'
import * as battlereports from './ingame/battlereports'
import * as messages from './ingame/messages'

import * as playerStatsDb from './playerstats-db'

export async function initData(): Promise<void> {
  console.time('init data-ingame')

  console.time('migrate-old')
  if (existsSync('persist/battlereports')) {
    const oldBattlereports = loadAll('persist/battlereports') as messages.RawMessage[]
    messages.battlereports.add(oldBattlereports)
    rmdirSync('persist/battlereports', {recursive: true})
    console.timeLog('migrate-old', 'battlereports', oldBattlereports.length)
  }

  if (existsSync('persist/failed-bs-messages.json')) {
    const oldFailedMessages = JSON.parse(readFileSync('persist/failed-bs-messages.json', 'utf8')) as FailedBSMessage[]
    messages.failed.add(oldFailedMessages.map(o => ({
      providingTgUser: o.from.id,
      text: o.text,
      time: o.forward_date
    })))
    unlinkSync('persist/failed-bs-messages.json')
    console.timeLog('migrate-old', 'failed', oldFailedMessages.length)
  }

  console.timeEnd('migrate-old')

  await tryRemoveFailed()

  console.time('init attackscouts')
  initAttackscouts()
  console.timeEnd('init attackscouts')

  console.time('init battlereports')
  initBattlereports()
  console.timeEnd('init battlereports')

  console.time('init playerStatsDb')
  console.timeLog('init playerStatsDb', playerStatsDb.list().length)
  console.timeEnd('init playerStatsDb')

  console.timeEnd('init data-ingame')
}

function initAttackscouts(): void {
  for (const {providingTgUser, text, time} of messages.attackscouts.values()) {
    try {
      const {attackscout} = parseGamescreenContent(text)
      if (!attackscout) {
        console.warn('parsed existing attackscout was empty!', providingTgUser, time, new Date(time * 1000))
        continue
      }

      attackscouts.add({
        ...attackscout,
        providingTgUser,
        time
      })
    } catch (_) {
      console.warn('failed to parse existing attackscout!', providingTgUser, time, new Date(time * 1000))
    }
  }
}

function initBattlereports(): void {
  for (const {providingTgUser, text, time} of messages.battlereports.values()) {
    try {
      const {battlereport} = parseGamescreenContent(text)
      if (!battlereport) {
        console.warn('parsed existing battlereport was empty!', providingTgUser, time, new Date(time * 1000))
        continue
      }

      battlereports.add({
        ...battlereport,
        providingTgUser,
        time
      })
    } catch (_) {
      console.warn('failed to parse existing battlereport!', providingTgUser, time, new Date(time * 1000))
    }
  }
}
