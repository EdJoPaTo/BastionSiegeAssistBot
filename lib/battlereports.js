const fs = require('fs')
const fsPromises = require('fs').promises

const stringify = require('json-stable-stringify')

const FOLDER = './persist/battlereports/'
if (!fs.existsSync(FOLDER)) {
  fs.mkdirSync(FOLDER)
}

function filenameOfUser(user) {
  return FOLDER + user + '.json'
}

async function save(user, data) {
  const content = stringify(data, {space: 2}) + '\n'
  await fsPromises.writeFile(filenameOfUser(user), content, 'utf8')
}

async function load(user) {
  try {
    const content = await fsPromises.readFile(filenameOfUser(user), 'utf8')
    return JSON.parse(content)
  } catch (error) {
    return {reports: {}}
  }
}

async function get(user, id) {
  const {reports} = await load(user)
  return reports[id]
}

async function add(user, id, report) {
  const current = await load(user)
  current.reports[id] = report
  save(user, current)
}

module.exports = {
  get,
  add
}
