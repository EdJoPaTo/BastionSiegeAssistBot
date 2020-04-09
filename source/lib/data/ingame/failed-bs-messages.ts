import {writeFileSync} from 'fs'

import {GamescreenContent, parseGamescreenContent} from 'bastion-siege-logic'
import arrayReduceGroupBy from 'array-reduce-group-by'

import {failed} from './messages'
import {parseAndSave} from './parse'

export async function tryRemoveFailed(): Promise<void> {
  console.time('tryRemoveFailed')
  const allFailed = failed.values()
  console.timeLog('tryRemoveFailed', allFailed.length)

  for (const o of allFailed) {
    try {
      const {providingTgUser, text, time} = o
      /* eslint no-await-in-loop: warn */
      await parseAndSave(providingTgUser, time, text)
      failed.remove(o)
    } catch (_) {}
  }

  console.timeLog('tryRemoveFailed', failed.values().length, 'still failing')

  if (process.env.NODE_ENV !== 'production') {
    writeAllGrouped()
  }

  console.timeEnd('tryRemoveFailed')
}

export function isEmptyContent(content: GamescreenContent): boolean {
  const keysOfInterest = Object.keys(content)
    .filter(o => o !== 'timestamp' && o !== 'ingameTimestamp')
  return keysOfInterest.length === 0
}

export function writeAllGrouped(): void {
  const sortedByText = [...failed.values()]
    .sort((a, b) => a.text.localeCompare(b.text))

  const groupedByTextStart = sortedByText
    .reduce(arrayReduceGroupBy(o => o.text.slice(0, 5)), {})
  writeFileSync('tmp/failed-start-text.json', JSON.stringify(groupedByTextStart, null, '\t'), 'utf8')

  const groupedBySameMinute = sortedByText
    .reduce(arrayReduceGroupBy(o => Math.floor(o.time / 60) * 60), {})
  writeFileSync('tmp/failed-time.json', JSON.stringify(groupedBySameMinute, null, '\t'), 'utf8')

  const groupedByError = sortedByText
    .reduce(arrayReduceGroupBy(o => {
      try {
        parseGamescreenContent(o.text)
      } catch (error) {
        return error instanceof Error ? error.message : String(error)
      }

      return ''
    }), {})
  writeFileSync('tmp/failed-error.json', JSON.stringify(groupedByError, null, '\t'), 'utf8')
}
