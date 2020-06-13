import {ManyFilesStore} from './many-files-store'

export interface RawMessage {
  readonly providingTgUser: number;
  readonly text: string;
  readonly time: number;
}

console.time('load messages')

export const attackscouts = new ManyFilesStore<RawMessage>('persist/messages/attackscouts', rawMessageKeyFunc, rawMessageSortFunc, messageMinuteDedublicateExistStringFunc)
console.timeLog('load messages', 'attackscouts', attackscouts.values().length)

export const battlereports = new ManyFilesStore<RawMessage>('persist/messages/battlereports', rawMessageKeyFunc, rawMessageSortFunc, messageMinuteDedublicateExistStringFunc)
console.timeLog('load messages', 'battlereports', battlereports.values().length)

export const failed = new ManyFilesStore<RawMessage>('persist/messages/failed', rawMessageKeyFunc, rawMessageSortFunc)
console.timeLog('load messages', 'failed', failed.values().length)

export const goldrankings = new ManyFilesStore<RawMessage>('persist/messages/goldrankings', rawMessageKeyFunc, rawMessageSortFunc, messageMinuteDedublicateExistStringFunc)
console.timeLog('load messages', 'goldrankings', goldrankings.values().length)

console.timeEnd('load messages')

function rawMessageKeyFunc(msg: RawMessage): string {
  return unixTimestampKeyFunction(msg.time)
}

function rawMessageSortFunc(a: RawMessage, b: RawMessage): number {
  return a.time - b.time
}

function messageMinuteDedublicateExistStringFunc(o: RawMessage): string {
  // Ignores the provider and rounds to the minute
  // BS1 only works based on each minute so a gold rank for example will not change within 20 seconds of the same minute
  // If the text is the same and happened within the same minute it will probably be the same
  const minute = Math.floor(o.time / 60)
  const {text} = o
  return `${minute} ${text}`
}

function unixTimestampKeyFunction(unixTimestamp: number): string {
  const date = new Date(unixTimestamp * 1000)
  const year = date.getUTCFullYear()
  const month = date.getUTCMonth() + 1
  const day = date.getUTCDate()
  const hour = date.getUTCHours()
  const hourSegment = Math.floor(hour / 3) * 3

  return `${year}-${month}/${day}/${hourSegment}`
}
