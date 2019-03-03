const {writeFileSync, readFileSync} = require('fs')

const arrayFilterUnique = require('array-filter-unique')
const stringify = require('json-stable-stringify')


const FILE = 'persist/inline-list.json'

const lists = load()

function load() {
  try {
    const content = JSON.parse(readFileSync(FILE))
    return content
  } catch (error) {
    return {}
  }
}

function save() {
  writeFileSync(FILE, stringify(lists, {space: 2}) + '\n', 'utf8')
}

function add(msgId, lastUsageTimestamp, userId) {
  if (!lists[msgId]) {
    lists[msgId] = {
      userIds: []
    }
  }

  lists[msgId].lastUsageTimestamp = lastUsageTimestamp
  lists[msgId].userIds = [
    ...lists[msgId].userIds,
    userId
  ]
    .filter(arrayFilterUnique())

  save()
  return lists[msgId].userIds
}

function remove(msgId, lastUsageTimestamp, userId) {
  if (!lists[msgId]) {
    return []
  }

  lists[msgId].lastUsageTimestamp = lastUsageTimestamp
  lists[msgId].userIds = lists[msgId].userIds
    .filter(o => o !== userId)

  save()
  return lists[msgId].userIds
}

module.exports = {
  add,
  remove
}
