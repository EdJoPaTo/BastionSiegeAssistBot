/* eslint @typescript-eslint/no-dynamic-delete: warn */

import {KeyValueInMemoryFile} from '@edjopato/datastore'

import {InlineList, InlineListParticipantAdd} from '../types'

export const PARTICIPANT_MAX_AGE = 60 * 12 // 12 min

const data = new KeyValueInMemoryFile<Record<string, InlineList>>('persist/inline-lists.json')

export function getList(creatorId: number, listId: string, now: number): InlineList {
  const lists = data.get(String(creatorId)) || {}
  const list = lists[listId] || {}

  if (!list.participants) {
    list.participants = {}
  }

  const {participants} = list
  const minParticipantTimestamp = now - PARTICIPANT_MAX_AGE

  for (const key of Object.keys(participants).map(o => Number(o))) {
    if (participants[key].lastUpdate < minParticipantTimestamp) {
      delete participants[key]
    }
  }

  return list
}

async function saveList(creatorId: number, listId: string, list: InlineList): Promise<void> {
  const lists = data.get(String(creatorId)) || {}
  lists[listId] = list
  await data.set(String(creatorId), lists)
}

export async function join(creatorId: number, listId: string, timestamp: number, joiningId: number | number[], participantInfo: InlineListParticipantAdd = {}): Promise<InlineList> {
  const list = getList(creatorId, listId, timestamp)

  list.lastUpdate = timestamp

  const joiningIds = Array.isArray(joiningId) ? joiningId : [joiningId]
  for (const id of joiningIds) {
    list.participants[id] = {
      lastUpdate: timestamp,
      ...participantInfo
    }
  }

  await saveList(creatorId, listId, list)
  return list
}

export async function leave(creatorId: number, listId: string, timestamp: number, leaverId: number | number[]): Promise<InlineList> {
  const list = getList(creatorId, listId, timestamp)
  list.lastUpdate = timestamp

  const leavingIds = Array.isArray(leaverId) ? leaverId : [leaverId]
  for (const id of leavingIds) {
    delete list.participants[id]
  }

  await saveList(creatorId, listId, list)
  return list
}
