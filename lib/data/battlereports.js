const fs = require('fs')
const fsPromises = require('fs').promises

const stringify = require('json-stable-stringify')

const {getScreenInformation} = require('../input/gamescreen')

const DEFAULT_DATA = {
  reports: {},
  reportsRaw: {}
}

const FOLDER = './persist/battlereports/'
if (!fs.existsSync(FOLDER)) {
  fs.mkdirSync(FOLDER)
}

const RAW_FILE = 'persist/battlereports.json'
const DEFAULT_DATA_RAW_FILE = {
  raw: []
}

const allRaw = loadRaw().raw
let allBattlereports = allRaw
  .map(({time, providingTgUser, text}) => ({...getScreenInformation(text).battlereport, time: Number(time), providingTgUser}))

console.log('loaded', allBattlereports.length, 'battlereports')

migrateOldToNew()
  .then(notMigrateable => {
    allBattlereports = notMigrateable.concat(allBattlereports)
    console.log('migrated old battlereports. not migrateable:', notMigrateable.length, 'Total Reports loaded:', allBattlereports.length)
  })

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

async function migrateOldToNew() {
  const users = await getUsers()
  const allFileContents = await Promise.all(
    users.map(o => load(o))
  )

  const reports = allFileContents
    .map(o => o.reportsRaw)
    .flatMap((reportList, i) => {
      const user = users[i]
      return Object.keys(reportList)
        .map(time => ({
          time,
          raw: reportList[time],
          user
        }))
        .map(obj => {
          obj.report = getScreenInformation(obj.raw).battlereport
          return obj
        })
    })

  // TODO: Remove when data is migrated
  reports.forEach(({user, time, report, raw}) => {
    add(user, time, report, raw)
  })

  const notMigrateable = []
  users.forEach((user, i) => {
    const currentContent = allFileContents[i]
    const availableKeys = Object.keys(currentContent.reportsRaw)
    availableKeys.forEach(key => {
      delete currentContent.reports[key]
    })
    delete currentContent.reportsRaw

    notMigrateable.push(currentContent.reports)
    save(user, currentContent)
  })

  return notMigrateable
    .flatMap(o => Object.keys(o).map(time => ({...o[time], time: Number(time)})))
}

function filenameOfUser(user) {
  return FOLDER + user + '.json'
}

function save(user, data) {
  const content = stringify(data, {space: 2}) + '\n'
  fs.writeFileSync(filenameOfUser(user), content, 'utf8')
}

async function load(user) {
  try {
    const contentString = await fsPromises.readFile(filenameOfUser(user), 'utf8')
    const content = JSON.parse(contentString)
    return {...DEFAULT_DATA, ...content}
  } catch (error) {
    console.trace('failed to load', user, error)
    return {...DEFAULT_DATA}
  }
}

async function getUsers() {
  try {
    const files = await fsPromises.readdir(FOLDER)
    const users = files
      .map(o => o.replace('.json', ''))
      .map(o => Number(o))
    return users
  } catch (error) {
    console.trace('failed to read users', error)
    return []
  }
}

function getAll() {
  return [...allBattlereports]
}

function add(user, time, report, raw) {
  const exists = allRaw
    .filter(o => o.time === time)
    .some(o => o.text === raw)

  if (!exists) {
    allBattlereports.push({
      ...report,
      time
    })
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
  getAll
}
