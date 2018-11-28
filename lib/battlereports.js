const fs = require('fs')
const fsPromises = require('fs').promises

const stringify = require('json-stable-stringify')

const DEFAULT_DATA = {
  reports: {},
  reportsRaw: {}
}

const FOLDER = './persist/battlereports/'
if (!fs.existsSync(FOLDER)) {
  fs.mkdirSync(FOLDER)
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

function loadSync(user) {
  try {
    const contentString = fs.readFileSync(filenameOfUser(user), 'utf8')
    const content = JSON.parse(contentString)
    return {...DEFAULT_DATA, ...content}
  } catch (error) {
    console.trace('failed to loadSync', user, error)
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

function objToArray(obj, nameOfKeyInNewArrayObj) {
  return Object.keys(obj)
    .map(key => {
      const element = {...obj[key]}
      element[nameOfKeyInNewArrayObj] = key
      return element
    })
}

async function getAll() {
  const users = await getUsers()
  const allFileContents = await Promise.all(
    users.map(o => load(o))
  )

  const reports = allFileContents
    .map(o => o.reports)
    .flatMap(o => objToArray(o, 'time'))
  return reports
}

async function get(user, id) {
  const reports = await getAllFrom(user)
  return reports[id]
}

async function getAllFrom(user) {
  const {reports} = await load(user)
  return reports
}

function add(user, id, report, raw) {
  const current = loadSync(user)
  current.reports[id] = report
  current.reportsRaw[id] = raw
  save(user, current)
}

function overrideBunch(user, reports) {
  const current = loadSync(user)
  current.reports = {...current.reports, ...reports}
  save(user, current)
}

module.exports = {
  add,
  get,
  getAll,
  getAllFrom,
  getUsers,
  load,
  overrideBunch
}
