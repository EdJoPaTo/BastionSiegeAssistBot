const regexHelper = require('./regex-helper')
const gamescreenName = require('./gamescreen-name')
const {emoji} = require('./gamescreen.emoji')

const {
  getBuildings,
  getMainResources,
  getStorageResources,
  getTradeResources,
  getBattlereportBasicRaw,
  getBattlereportFromRaw
} = require('./gamescreen.general')

function detectType(content) {
  const lines = content.split('\n')

  if (content.indexOf('Season') >= 0) {
    return 'main'
  }
  if (lines[0].indexOf('Buildings') >= 0) {
    return 'buildings'
  }
  if (lines[0].indexOf('Storage') >= 0) {
    return 'storage'
  }
  if (lines[0].indexOf('Workshop') >= 0) {
    return 'workshop'
  }
  if (lines[0].indexOf('Trebuchet') >= 0) {
    return 'trebuchet'
  }
  if (lines[0].indexOf('Resources') >= 0) {
    return 'resources'
  }
  if (lines[0].indexOf('battle with') >= 0 && lines[0].indexOf('alliance') >= 0) {
    return 'alliance-battlereport'
  }
  if (lines[0].indexOf('battle with') >= 0) {
    return 'battlereport'
  }
  if (lines[0].indexOf('battle was all night') >= 0) {
    return 'patrolreport'
  }
  if (lines[0].indexOf('Our scouts found') >= 0) {
    return 'attackscout'
  }
  if (lines[0].indexOf('Your domain attacked') >= 0) {
    return 'attackincoming'
  }

  return 'unknown'
}

function getScreenInformation(type, content) {
  switch (type) {
    case 'buildings': return getBuildings(content)
    case 'workshop': return getWorkshopBuildings(content)
    case 'main': return getMainResources(content)
    case 'storage': return getStorageResources(content)
    case 'resources': return getTradeResources(content)
    case 'alliance-battlereport': return getBattlereportFromRaw(getRawBattlereport(content))
    case 'battlereport': return getBattlereportFromRaw(getRawBattlereport(content))
    case 'attackscout': return getAttackScout(content)
    case 'attackincoming': return getAttackIncoming(content)
    default: return {}
  }
}

function getWorkshopBuildings(content) {
  return {workshop: {
    trebuchet: regexHelper.getNumber(content, `${emoji.trebuchet}Trebuchet\\s+(\\d+)`),
    ballista: regexHelper.getNumber(content, `${emoji.ballista}Ballista\\s+(\\d+)`)
  }}
}

function getRawBattlereport(content) {
  const raw = getBattlereportBasicRaw(content)
  raw.won = /Your (?:(?:army)|(?:alliance)) won/.test(content)
  if (raw.won) {
    raw.me = regexHelper.get(content, /Congratulations, ([^!]+)!/)
  } else {
    raw.me = regexHelper.get(content, /Unfortunately, ([^,]+), your army lose./)
  }

  const winners = regexHelper.get(content, /Winners: (.+)/)
  const losers = regexHelper.get(content, /Losers: (.+)/)

  if (winners) {
    raw.winners = winners.split(', ')
    raw.losers = losers.split(', ')
  } else {
    const fullEnemy = regexHelper.get(content, /battle with (.+) complete/, 1)
    const enemy = gamescreenName.parse(fullEnemy).name
    raw.enemy = enemy
  }

  const soldiersMatch = new RegExp(`(\\d+)${emoji.regexArmy} of (\\d+)${emoji.regexArmy}`).exec(content)
  const noneOf = regexHelper.getNumber(content, `None of the (\\d+)${emoji.regexArmy}`)
  const withoutLoss = regexHelper.getNumber(content, `(\\d+)${emoji.regexArmy} without a loss`)
  if (noneOf !== undefined) {
    raw.soldiersAlive = 0
    raw.soldiersTotal = noneOf
  } else if (withoutLoss) {
    raw.soldiersAlive = withoutLoss
    raw.soldiersTotal = withoutLoss
  } else if (soldiersMatch) {
    raw.soldiersAlive = Number(soldiersMatch[1])
    raw.soldiersTotal = Number(soldiersMatch[2])
  } else {
    console.log('soldiers unknown', content)
    throw new Error('soldiers unknown')
  }

  return raw
}

function getAttackScout(content) {
  const namePart = regexHelper.get(content, /Our scouts found (.+) in his domain/)
  const {name} = gamescreenName.parse(namePart)

  return {attackscout: {
    player: name,
    karma: regexHelper.getNumber(content, `(\\d+)${emoji.karma}`),
    terra: regexHelper.getNumber(content, `(\\d+)${emoji.terra}`)
  }}
}

function getAttackIncoming(content) {
  const namePart = regexHelper.get(content, /attacked! (.+) approaches/)
  const {name} = gamescreenName.parse(namePart)

  return {attackincoming: {
    player: name
  }}
}

module.exports = {
  detectType,
  getScreenInformation
}
