const stringify = require('json-stable-stringify')

const battlereports = require('./battlereports')
const {getScreenInformation} = require('./gamescreen')

async function getWrongBattlereportTimes() {
  const users = await battlereports.getUsers()
  const resultArr = await Promise.all(
    users
      .map(async user => ({
        user,
        badTimes: await getWrongBattlereportTimesOfUser(user)
      }))
  )

  const result = {}
  resultArr
    .filter(o => o.badTimes.length > 0)
    .forEach(({user, badTimes}) => {
      result[user] = badTimes
    })
  return result
}

async function getWrongBattlereportTimesOfUser(user) {
  const {reports, reportsRaw} = await battlereports.load(user)

  return Object.keys(reportsRaw)
    .filter(time => {
      const report = reports[time]
      const raw = reportsRaw[time]

      const expectedReport = getScreenInformation(raw).battlereport
      const isDifferent = stringify(expectedReport) !== stringify(report)
      if (isDifferent) {
        console.log('found different report', user, time, report, raw, JSON.parse(stringify(expectedReport)))
      }
      return isDifferent
    })
}

async function findAndFixBadBattlereports() {
  const badStuff = await getWrongBattlereportTimes()
  await Promise.all(
    Object.keys(badStuff)
      .map(user => fixBadBattlereports(user, badStuff[user]))
  )
  console.log('finished fixing bad battlereports')
}

async function fixBadBattlereports(user, badTimes) {
  const {reportsRaw} = await battlereports.load(user)

  const fixedReports = {}
  badTimes
    .forEach(time => {
      const raw = reportsRaw[time]
      const newReport = getScreenInformation(raw).battlereport
      fixedReports[time] = newReport
    })

  return battlereports.overrideBunch(user, fixedReports)
}

module.exports = {
  findAndFixBadBattlereports
}
