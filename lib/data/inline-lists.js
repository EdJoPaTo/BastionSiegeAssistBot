const InMemoryFromSingleFileCache = require('./in-memory-from-single-file-cache')

const PARTICIPANT_MAX_AGE = 60 * 12 // 12 min

const DEFAULT_LIST_CONTENT = {
  lastUpdate: undefined,
  participants: {}
}

// Data: Dictionary<tgId, {lastId: string, lists: Dictionary<listId, list>}>
const cache = new InMemoryFromSingleFileCache('persist/inline-lists.json')

function getList(creatorId, now) {
  const list = cache.data[creatorId] || DEFAULT_LIST_CONTENT

  const {participants} = list
  const minParticipantTimestamp = now - PARTICIPANT_MAX_AGE

  for (const key of Object.keys(participants)) {
    if (participants[key].lastUpdate < minParticipantTimestamp) {
      delete participants[key]
    }
  }

  return list
}

function join(creatorId, timestamp, joiningId, participantInfo = {}) {
  const list = getList(creatorId)

  list.lastUpdate = timestamp

  const joiningIds = Array.isArray(joiningId) ? joiningId : [joiningId]
  for (const id of joiningIds) {
    list.participants[id] = {
      lastUpdate: timestamp,
      ...participantInfo
    }
  }

  cache.data[creatorId] = list
  cache.save()
  return list
}

function leave(creatorId, timestamp, leaverId) {
  const list = getList(creatorId)
  list.lastUpdate = timestamp

  const leavingIds = Array.isArray(leaverId) ? leaverId : [leaverId]
  for (const id of leavingIds) {
    delete list.participants[id]
  }

  cache.save()
  return list
}

module.exports = {
  PARTICIPANT_MAX_AGE,
  getList,
  join,
  leave
}
