const {existsSync, readFileSync, writeFileSync} = require('fs')

const stringify = require('json-stable-stringify')

const {getScreenInformation} = require('../input/gamescreen')

const playerStatsDb = require('./playerstats-db')
const poweruser = require('./poweruser')

const RAW_FILE = 'persist/battlereports.json'
const DEFAULT_DATA_RAW_FILE = {
  raw: []
}

console.time('battlereports')
const allRaw = loadRaw().raw
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
      console.log('Failed to parse report. Skip it for now.', text, error)
      return null
    }
  })
  .filter(o => o)
console.timeLog('battlereports', 'loaded', allBattlereports.length, 'battlereports')

console.time('prefill data')
for (const report of allBattlereports) {
  playerStatsDb.addReport(report)
  poweruser.addReport(report)
}

console.timeEnd('prefill data')

console.time('playerdb list')
// By loading the list all playerstats get precached
const playerStats = playerStatsDb.list()
console.timeLog('playerdb list', 'loaded', playerStats.length, 'playerStats')

function loadRaw() {
  if (!existsSync(RAW_FILE)) {
    return {...DEFAULT_DATA_RAW_FILE}
  }

  try {
    const contentString = readFileSync(RAW_FILE, 'utf8')
    const content = JSON.parse(contentString)
    return {...DEFAULT_DATA_RAW_FILE, ...content}
  } catch (error) {
    console.log('failed to loadRaw', error)
    return {...DEFAULT_DATA_RAW_FILE}
  }
}

function saveRaw(data) {
  const content = stringify(data, {space: 2}) + '\n'
  writeFileSync(RAW_FILE, content, 'utf8')
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
  saveRaw({raw: allRaw})

  return true // Is a new report
}

module.exports = {
  add,
  getAll
}
