import {parseGamescreenContent, GamescreenContent} from 'bastion-siege-logic'
import {RawObjectInMemoryFile} from '@edjopato/datastore'

import {FailedBSMessage} from '../types'

import * as battlereports from './battlereports'

const data = new RawObjectInMemoryFile<FailedBSMessage[]>('persist/failed-bs-messages.json')

export async function checkNowWorking(): Promise<void> {
  const previouslyFailed = data.get() || []
  if (previouslyFailed.length > 0) {
    console.log('failed BS messages: start trying', previouslyFailed.length, 'previous failed messages…')
  }

  const stillFailing = previouslyFailed
    .filter(o => !canGetGamescreenContent(o))

  if (stillFailing.length > 0) {
    console.warn('failed BS messages: still', stillFailing.length, 'messages not detectable')
  } else {
    console.log('failed BS messages: no failing BS messages :)')
  }

  await data.set(stillFailing)
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

export async function add(message: FailedBSMessage): Promise<void> {
  const current = data.get() || []
  current.push(message)
  await data.set(current)
}
