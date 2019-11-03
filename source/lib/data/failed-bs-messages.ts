import {parseGamescreenContent, GamescreenContent} from 'bastion-siege-logic'

import {FailedBSMessage} from '../types'

import * as battlereports from './battlereports'
import InMemoryFromSingleFileCache from './in-memory-from-single-file-cache'

const cache = new InMemoryFromSingleFileCache<FailedBSMessage[]>('persist/failed-bs-messages.json', [])

export function checkNowWorking(): void {
  if (cache.data.length > 0) {
    console.log('failed BS messages: start trying', cache.data.length, 'previous failed messages…')
  }

  cache.data = cache.data
    .filter(o => !canGetGamescreenContent(o))

  if (cache.data.length > 0) {
    console.warn('failed BS messages: still', cache.data.length, 'messages not detectable')
  } else {
    console.log('failed BS messages: no failing BS messages :)')
  }

  cache.save()
}

function canGetGamescreenContent(message: FailedBSMessage): boolean {
  try {
    const content = parseGamescreenContent(message.text)

    const {battlereport} = content
    if (battlereport) {
      battlereports.add(message.from.id, message.forward_date, battlereport, message.text)
    }

    const isEmpty = isEmptyContent(content)
    return !isEmpty
  } catch (_) {
    // Nope, can not be detected
    return false
  }
}

export function isEmptyContent(content: GamescreenContent): boolean {
  const keysOfInterest = Object.keys(content)
    .filter(o => o !== 'timestamp' && o !== 'ingameTimestamp')
  return keysOfInterest.length === 0
}

export function add(message: FailedBSMessage): void {
  cache.data.push(message)
  cache.save()
}
