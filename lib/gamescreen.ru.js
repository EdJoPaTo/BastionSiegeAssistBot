const regexHelper = require('./regex-helper')
const gamescreenName = require('./gamescreen-name')
const {emoji} = require('./gamescreen.emoji')

const {
  getBuildings,
  getMainResources,
  getTradeResources,
  getBattlereportBasicRaw,
  getBattlereportFromRaw
} = require('./gamescreen.general')

function detectType(content) {
  const lines = content.split('\n')

  if (content.indexOf('Сезон') >= 0) {
    return 'main'
  }
  if (lines[0].indexOf('Постройки') >= 0) {
    return 'buildings'
  }
  if (lines[0].indexOf('Склад') >= 0) {
    return 'storage'
  }
  if (lines[0].indexOf('Мастерская') >= 0) {
    return 'workshop'
  }
  if (lines[0].indexOf('Требушет') >= 0) {
    return 'trebuchet'
  }
  if (lines[0].indexOf('Ресурсы') >= 0) {
    return 'resources'
  }
  if (lines[0].indexOf('Битва с') >= 0 && lines[0].indexOf('альянсом') >= 0) {
    return 'alliance-battlereport'
  }
  if (lines[0].indexOf('Битва с') >= 0) {
    return 'battlereport'
  }
  if (lines[0].indexOf('Завязалась кровавая битва') >= 0) {
    return 'patrolreport'
  }
  if (lines[0].indexOf('Разведчики докладывают') >= 0) {
    return 'attackscout'
  }
  if (lines[0].indexOf('Твои владения атакованы') >= 0) {
    return 'attackincoming'
  }
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

function getStorageResources(content) {
  return {resources: {
    gold: regexHelper.getNumber(content, `Золото\\s+(\\d+)${emoji.gold}`),
    wood: regexHelper.getNumber(content, `(\\d+)/\\d+${emoji.wood}`),
    stone: regexHelper.getNumber(content, `(\\d+)/\\d+${emoji.stone}`),
    food: regexHelper.getNumber(content, `(\\d+)/\\d+${emoji.food}`)
  }}
}

function getWorkshopBuildings(content) {
  return {workshop: {
    trebuchet: regexHelper.getNumber(content, `${emoji.trebuchet}Требушет\\s+(\\d+)`),
    ballista: regexHelper.getNumber(content, `${emoji.ballista}Баллиста\\s+(\\d+)`)
  }}
}

function getRawBattlereport(content) {
  const raw = getBattlereportBasicRaw(content)
  raw.won = /Поздравляю/.test(content)
  if (raw.won) {
    raw.me = regexHelper.get(content, /Поздравляю, ([^!]+)!/)
  } else {
    raw.me = regexHelper.get(content, /К сожалению, ([^,]+), твоя армия потерпела поражение./)
  }

  const winners = regexHelper.get(content, /Победители: (.+)/)
  const losers = regexHelper.get(content, /Проигравшие: (.+)/)

  if (winners) {
    raw.winners = winners.split(', ')
    raw.losers = losers.split(', ')
  } else {
    const fullEnemy = regexHelper.get(content, /Битва с (.+) окончена/, 1)
    const enemy = gamescreenName.parse(fullEnemy).name
    raw.enemy = enemy
  }

  const soldiersMatch = new RegExp(`(\\d+)${emoji.regexArmy} из (\\d+)${emoji.regexArmy}`).exec(content)
  const noneOf = regexHelper.getNumber(content, `Никто из (\\d+)${emoji.regexArmy}`)
  const noneOf2 = regexHelper.getNumber(content, `каждый из (\\d+)${emoji.regexArmy} отдал свою жизнь`)
  const withoutLoss = regexHelper.getNumber(content, `(\\d+)${emoji.regexArmy} без единой потери`)
  if (noneOf !== undefined) {
    raw.soldiersAlive = 0
    raw.soldiersTotal = noneOf
  } else if (noneOf2 !== undefined) {
    raw.soldiersAlive = 0
    raw.soldiersTotal = noneOf2
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
  const namePart = regexHelper.get(content, /расположился (.+) в своих владениях/)
  const {name} = gamescreenName.parse(namePart)

  return {attackscout: {
    player: name,
    karma: regexHelper.getNumber(content, `(\\d+)${emoji.karma}`),
    terra: regexHelper.getNumber(content, `(\\d+)${emoji.terra}`)
  }}
}

function getAttackIncoming(content) {
  const namePart = regexHelper.get(content, /атакованы! (.+) подступает/)
  const {name} = gamescreenName.parse(namePart)

  return {attackincoming: {
    player: name
  }}
}

module.exports = {
  detectType,
  getScreenInformation
}
