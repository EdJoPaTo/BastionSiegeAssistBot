import {InlineList, InlineListParticipantAdd} from '../types'

import InMemoryFromSingleFileCache from './in-memory-from-single-file-cache'

export const PARTICIPANT_MAX_AGE = 60 * 12 // 12 min

type Dictionary<T> = {[key: string]: T}

const cache = new InMemoryFromSingleFileCache<Dictionary<Dictionary<InlineList>>>('persist/inline-lists.json')

export function getList(creatorId: number, listId: string, now: number): InlineList {
  const lists = cache.data[creatorId] || {}
  const list = lists[listId] || {}

  if (!list.participants) {
    list.participants = {}
  }

  const {participants} = list
  const minParticipantTimestamp = now - PARTICIPANT_MAX_AGE

  for (const key of Object.keys(participants)) {
    if (participants[key].lastUpdate < minParticipantTimestamp) {
      delete participants[key]
    }
  }

  return list
}

export function join(creatorId: number, listId: string, timestamp: number, joiningId: number, participantInfo: InlineListParticipantAdd = {}): InlineList {
  const list = getList(creatorId, listId, timestamp)

  list.lastUpdate = timestamp

  const joiningIds = Array.isArray(joiningId) ? joiningId : [joiningId]
  for (const id of joiningIds) {
    list.participants[id] = {
      lastUpdate: timestamp,
      ...participantInfo
    }
  }

  if (!cache.data[creatorId]) {
    cache.data[creatorId] = {}
  }

  cache.data[creatorId][listId] = list
  cache.save()
  return list
}

export function leave(creatorId: number, listId: string, timestamp: number, leaverId: number | number[]): InlineList {
  const list = getList(creatorId, listId, timestamp)
  list.lastUpdate = timestamp

  const leavingIds = Array.isArray(leaverId) ? leaverId : [leaverId]
  for (const id of leavingIds) {
    delete list.participants[id]
  }

  cache.save()
  return list
}
