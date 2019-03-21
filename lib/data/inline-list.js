const arrayFilterUnique = require('array-filter-unique')

const InMemoryFromSingleFileCache = require('./in-memory-from-single-file-cache')

const cache = new InMemoryFromSingleFileCache('persist/inline-list.json')

function add(msgId, lastUsageTimestamp, userId) {
  if (!cache.data[msgId]) {
    cache.data[msgId] = {
      userIds: []
    }
  }

  const list = cache.data[msgId]
  list.lastUsageTimestamp = lastUsageTimestamp
  list.userIds = [
    ...list.userIds,
    userId
  ]
    .filter(arrayFilterUnique())

  cache.save()
  return list.userIds
}

function remove(msgId, lastUsageTimestamp, userId) {
  const list = cache.data[msgId]
  if (!list) {
    return []
  }

  list.lastUsageTimestamp = lastUsageTimestamp
  list.userIds = list.userIds
    .filter(o => o !== userId)

  cache.save()
  return list.userIds
}

module.exports = {
  add,
  remove
}
