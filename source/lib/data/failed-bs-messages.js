const {parseGamescreenContent} = require('bastion-siege-logic')

const battlereports = require('./battlereports')
const InMemoryFromSingleFileCache = require('./in-memory-from-single-file-cache')

const cache = new InMemoryFromSingleFileCache('persist/failed-bs-messages.json', [])

function checkNowWorking() {
  if (cache.data.length > 0) {
    console.log('failed BS messages: start trying', cache.data.length, 'previous failed messages…')
  }

  cache.data = cache.data
    .filter(o => !canGetGamescreenContent(o))

  if (cache.data.length > 0) {
    console.warn('failed BS messages: still', cache.data.length, 'messages not detectable')
  } else {
    console.log('failed BS messages: no failing BS messages :)')
  }

  cache.save()
}

function canGetGamescreenContent(message) {
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

function isEmptyContent(content) {
  const keysOfInterest = Object.keys(content)
    .filter(o => o !== 'timestamp' && o !== 'ingameTimestamp')
  return keysOfInterest.length === 0
}

async function add(message) {
  cache.data.push(message)
  cache.save()
}

module.exports = {
  add,
  checkNowWorking,
  isEmptyContent
}
