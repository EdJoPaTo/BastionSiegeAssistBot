const regexHelper = require('../javascript-abstraction/regex-helper')
const gamescreenName = require('./gamescreen-name')
const {emoji} = require('./game-text')

const {
  EFFECTS_REGEX,
  getBattlereportBasicRaw,
  getBattlereportFromRaw,
  getBuildings,
  getEffects,
  getMainResources,
  getTradeResources,
  getWarMenuDomainStats
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
  if (lines[0].indexOf('Wins') >= 0) {
    return 'war'
  }
  if (lines[0].indexOf('‼️The battle with ') >= 0) {
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
  if (EFFECTS_REGEX.test(lines[0]) &&
    (content.indexOf('Will last until: ') >= 0 || content.indexOf('Will continue: ') >= 0)
  ) {
    return 'effects'
  }
}

function getScreenInformation(type, content) {
  switch (type) {
    case 'buildings': return getBuildings(content)
    case 'workshop': return getWorkshopBuildings(content)
    case 'main': return getMainResources(content)
    case 'storage': return getStorageResources(content)
    case 'resources': return getTradeResources(content)
    case 'war': return getWarMenuDomainStats(content)
    case 'alliance-battlereport': return getBattlereportFromRaw(getRawBattlereport(content))
    case 'battlereport': return getBattlereportFromRaw(getRawBattlereport(content))
    case 'attackscout': return getAttackScout(content)
    case 'attackincoming': return getAttackIncoming(content)
    case 'effects': return getEffects(content)
    default: return {}
  }
}

function getStorageResources(content) {
  return {resources: {
    gold: regexHelper.getNumber(content, `Gold\\s+(\\d+)${emoji.gold}`),
    wood: regexHelper.getNumber(content, `(\\d+)/\\d+${emoji.wood}`),
    stone: regexHelper.getNumber(content, `(\\d+)/\\d+${emoji.stone}`),
    food: regexHelper.getNumber(content, `(\\d+)/\\d+${emoji.food}`)
  }}
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

  const fullEnemy = regexHelper.get(content, /battle with (?:alliance )?(.+) complete/)
  const enemy = gamescreenName.parse(fullEnemy)
  raw.enemy = enemy.name
  raw.enemyAlliance = enemy.alliance

  const winners = regexHelper.get(content, /Winners: (.+)/)
  const losers = regexHelper.get(content, /Losers: (.+)/)

  if (winners) {
    raw.winners = winners.split(', ')
    raw.losers = losers.split(', ')
  }

  const soldiersMatch = new RegExp(`(\\d+)${emoji.regexArmy} of (\\d+)${emoji.regexArmy}`).exec(content)
  const noneOf = regexHelper.getNumber(content, `None of the (\\d+)${emoji.regexArmy}`)
  const noneOf2 = regexHelper.getNumber(content, `each of (\\d+)${emoji.regexArmy} gave his life`)
  const withoutLoss = regexHelper.getNumber(content, `(\\d+)${emoji.regexArmy} without a loss`)
  if (noneOf !== undefined) {
    raw.soldiersAlive = 0
    raw.soldiersTotal = noneOf
  } else if (noneOf2 !== undefined) {
    raw.soldiersAlive = 0
    raw.soldiersTotal = noneOf2
  } else if (withoutLoss !== undefined) {
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
