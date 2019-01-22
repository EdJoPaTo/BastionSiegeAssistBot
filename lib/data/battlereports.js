const fs = require('fs')

const arrayFilterUnique = require('array-filter-unique')
const stringify = require('json-stable-stringify')

const {getScreenInformation} = require('../input/gamescreen')

const RAW_FILE = 'persist/battlereports.json'
const DEFAULT_DATA_RAW_FILE = {
  raw: []
}

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
console.log('loaded', allBattlereports.length, 'battlereports')

let allPlayers = allBattlereports
  .flatMap(o => o.enemies.map(enemy => ({player: enemy, alliance: o.enemyAlliance})))
  .filter(arrayFilterUnique(o => o.player, true))
console.log('loaded', allPlayers.length, 'players')

function loadRaw() {
  if (!fs.existsSync(RAW_FILE)) {
    return {...DEFAULT_DATA_RAW_FILE}
  }

  try {
    const contentString = fs.readFileSync(RAW_FILE, 'utf8')
    const content = JSON.parse(contentString)
    return {...DEFAULT_DATA_RAW_FILE, ...content}
  } catch (error) {
    console.log('failed to loadRaw', error)
    return {...DEFAULT_DATA_RAW_FILE}
  }
}

function saveRaw(data) {
  const content = stringify(data, {space: 2}) + '\n'
  fs.writeFileSync(RAW_FILE, content, 'utf8')
}

function getAll() {
  return [...allBattlereports]
}

function getAllPlayers() {
  return [...allPlayers]
}

function add(user, time, report, raw) {
  const exists = allRaw
    .filter(o => o.time === time)
    .some(o => o.text === raw)

  if (!exists) {
    if (report) {
      allBattlereports.push({
        ...report,
        time,
        providingTgUser: user
      })
      allPlayers = allPlayers
        .filter(o => report.enemies.indexOf(o.player) < 0)
        .concat(report.enemies.map(o => ({player: o, alliance: report.enemyAlliance})))
    }

    allRaw.push({
      providingTgUser: user,
      text: raw,
      time
    })
    allRaw.sort((a, b) => a.time - b.time)
    saveRaw({raw: allRaw})
  }

  return !exists // Return if its a new report
}

module.exports = {
  add,
  getAll,
  getAllPlayers
}
