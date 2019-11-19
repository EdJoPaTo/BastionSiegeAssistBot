import {GamescreenContent} from 'bastion-siege-logic'

import {failed} from './messages'
import {parseAndSave} from './parse'

export function tryRemoveFailed(): void {
  console.time('tryRemoveFailed')
  const allFailed = failed.values()
  console.timeLog('tryRemoveFailed', allFailed.length)

  for (const o of allFailed) {
    try {
      const {providingTgUser, text, time} = o
      parseAndSave(providingTgUser, time, text)
      failed.remove(o)
    } catch (_) {}
  }

  console.timeLog('tryRemoveFailed', failed.values().length, 'still failing')
  console.timeEnd('tryRemoveFailed')
}

export function isEmptyContent(content: GamescreenContent): boolean {
  const keysOfInterest = Object.keys(content)
    .filter(o => o !== 'timestamp' && o !== 'ingameTimestamp')
  return keysOfInterest.length === 0
}
