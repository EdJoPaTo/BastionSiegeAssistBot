const fs = require('fs')
const fsPromises = require('fs').promises

const stringify = require('json-stable-stringify')

const DEFAULT_DATA = {
  reports: {}
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

async function getAll() {
  try {
    const files = await fsPromises.readdir(FOLDER)
    const users = files
      .map(o => o.replace('.json', ''))
      .map(o => Number(o))
    const allFileContents = await Promise.all(
      users.map(o => load(o))
    )

    const reports = []
    allFileContents
      .map(o => o.reports)
      .forEach(userReports => {
        Object.keys(userReports)
          .forEach(time => {
            reports.push({...userReports[time], time})
          })
      })
    return reports
  } catch (error) {
    return []
  }
}

async function get(user, id) {
  const reports = await getAllFrom(user)
  return reports[id]
}

async function getAllFrom(user) {
  const {reports} = await load(user)
  return reports
}

function add(user, id, report) {
  const current = loadSync(user)
  current.reports[id] = report
  save(user, current)
}

module.exports = {
  get,
  getAll,
  getAllFrom,
  add
}
