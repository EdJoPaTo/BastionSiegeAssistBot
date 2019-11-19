import {ManyFilesStore} from './many-files-store'

export interface RawMessage {
  providingTgUser: number;
  text: string;
  time: number;
}

console.time('load messages')

export const attackscouts = new ManyFilesStore<RawMessage>('persist/messages/attackscouts', rawMessageKeyFunc)
console.timeLog('load messages', 'attackscouts', attackscouts.values().length)

export const battlereports = new ManyFilesStore<RawMessage>('persist/messages/battlereports', rawMessageKeyFunc)
console.timeLog('load messages', 'battlereports', battlereports.values().length)

export const failed = new ManyFilesStore<RawMessage>('persist/messages/failed', rawMessageKeyFunc)
console.timeLog('load messages', 'failed', failed.values().length)

export const goldrankings = new ManyFilesStore<RawMessage>('persist/messages/goldrankings', rawMessageKeyFunc)
console.timeLog('load messages', 'goldrankings', goldrankings.values().length)

console.timeEnd('load messages')

function rawMessageKeyFunc(msg: RawMessage): string {
  return unixTimestampKeyFunction(msg.time)
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
