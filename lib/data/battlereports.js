const {mkdirSync, readdirSync, readFileSync, unlinkSync, writeFileSync} = require('fs')

const stringify = require('json-stable-stringify')
const arrayFilterUnique = require('array-filter-unique')

const {getScreenInformation} = require('../input/gamescreen')

const playerStatsDb = require('./playerstats-db')
const poweruser = require('./poweruser')

const RAW_FILE = 'persist/battlereports.json'
const FOLDER = 'persist/battlereports/'
mkdirSync(FOLDER, {recursive: true})

const DEFAULT_DATA_RAW_FILE = {
  raw: []
}

console.time('battlereports')
const allRaw = loadRaw()
console.timeLog('battlereports', 'loaded', allRaw.length, 'raw battlereports')
const allBattlereports = allRaw
  .map(({time, providingTgUser, text}) => {
    try {
      const {battlereport} = getScreenInformation(text)
      if (!battlereport) {
        console.log('Report should not be empty. Something was not read correctly. Skip it for now.', text)
        return null
      }

      return {
        ...battlereport,
        time: Number(time),
        providingTgUser
      }
    } catch (error) {
      console.log('Failed to parse report. Skip it for now.', time, text, error)
      return null
    }
  })
  .filter(o => o)
console.timeEnd('battlereports')
console.log('battlereports: loaded', allBattlereports.length, 'battlereports')

console.time('migrate battlereport files')
// TODO: remove migration (BREAKING CHANGE)
saveAllRaw()
try {
  unlinkSync(RAW_FILE)
} catch (error) {}

console.timeEnd('migrate battlereport files')

console.time('poweruser prefill')
allBattlereports.forEach(r => poweruser.addReport(r))
console.timeEnd('poweruser prefill')

console.time('playerStatsDb')
allBattlereports.forEach(r => playerStatsDb.addReport(r))
console.timeLog('playerStatsDb', 'prefill')

// By loading the list all playerstats get precached
const playerStats = playerStatsDb.list()
console.timeLog('playerStatsDb')
console.log('playerStatsDb: loaded', playerStats.length, 'playerStats')

function getAllJsonsSync(folder) {
  const content = readdirSync(folder)
  const folders = content.filter(o => !o.includes('.'))
  const files = content.filter(o => o.endsWith('.json'))

  return [
    ...folders.flatMap(o => getAllJsonsSync(`${folder}/${o}`)),
    ...files.map(o => `${folder}/${o}`)
  ]
}

function loadRaw() {
  const allFiles = getAllJsonsSync(FOLDER)
  const raws = allFiles
    .map(o => loadRawFile(o).raw)
    .flat()
    // Ensure there are no duplicate reports.
    // When multiple people send the same report everyone but one will lose them
    .filter(arrayFilterUnique(o => `${o.time} ${o.text}`))
    .sort((a, b) => a.time - b.time)

  // TODO: remove old way (BREAKING CHANGE)
  if (raws.length === 0) {
    return loadRawFile(RAW_FILE).raw
  }

  return raws
}

function loadRawFile(file) {
  try {
    const contentString = readFileSync(file, 'utf8')
    const content = JSON.parse(contentString)
    return {...DEFAULT_DATA_RAW_FILE, ...content}
  } catch (error) {
    console.error('failed to loadRaw', error)
    return {...DEFAULT_DATA_RAW_FILE}
  }
}

function filenameKeyFromTimestamp(unixTimestamp) {
  const date = new Date(unixTimestamp * 1000)
  const key = `${date.getUTCFullYear()}-${date.getUTCMonth() + 1}/${date.getUTCDate()}`
  return key
}

function saveAllRaw() {
  const groupedByYearMonth = allRaw.reduce((grouped, o) => {
    const key = filenameKeyFromTimestamp(o.time)
    if (!grouped[key]) {
      grouped[key] = []
    }

    grouped[key].push(o)
    return grouped
  }, {})

  for (const key of Object.keys(groupedByYearMonth)) {
    saveRawFile(key, {raw: groupedByYearMonth[key]})
  }
}

function saveRawSpecificTimestamp(timestamp) {
  const wantedKey = filenameKeyFromTimestamp(timestamp)
  const data = allRaw
    .filter(o => filenameKeyFromTimestamp(o.time) === wantedKey)

  saveRawFile(wantedKey, {raw: data})
}

function saveRawFile(key, data) {
  const fullFilename = `${FOLDER}${key}.json`
  const path = fullFilename.split('/').slice(0, -1).join('/')
  mkdirSync(path, {recursive: true})

  const content = stringify(data, {space: 2}) + '\n'
  writeFileSync(fullFilename, content, 'utf8')
}

function getAll() {
  return [...allBattlereports]
}

function add(user, time, report, raw) {
  const exists = allRaw
    .filter(o => o.time === time)
    .some(o => o.text === raw)

  if (exists) {
    return false // Not a new report
  }

  if (report) {
    const enrichedReport = {
      ...report,
      time,
      providingTgUser: user
    }

    allBattlereports.push(enrichedReport)
    playerStatsDb.addReport(enrichedReport)
    poweruser.addReport(enrichedReport)
  }

  allRaw.push({
    providingTgUser: user,
    text: raw,
    time
  })
  allRaw.sort((a, b) => a.time - b.time)
  saveRawSpecificTimestamp(time)

  return true // Is a new report
}

module.exports = {
  add,
  getAll
}
