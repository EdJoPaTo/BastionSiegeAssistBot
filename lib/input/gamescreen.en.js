const regexHelper = require('../javascript-abstraction/regex-helper')
const gamescreenName = require('./gamescreen-name')
const {emoji} = require('./game-text')

const {
  EFFECTS_REGEX,
  getBattlereportBasicRaw,
  getBattlereportFromRaw,
  getBuildings,
  getCastleSiegeParticipants,
  getEffects,
  getMainResources,
  getTradeResources,
  getWarMenuDomainStats
} = require('./gamescreen.general')

function detectType(content) {
  const lines = content.split('\n')

  if (content.includes('Season')) {
    return 'main'
  }

  if (lines[0].includes('Buildings')) {
    return 'buildings'
  }

  if (lines[0].includes('Storage')) {
    return 'storage'
  }

  if (lines[0].includes('Workshop')) {
    return 'workshop'
  }

  if (lines[0].includes('Trebuchet')) {
    return 'trebuchet'
  }

  if (lines[0].includes('Resources')) {
    return 'resources'
  }

  if (lines[0].includes('Wins')) {
    return 'war'
  }

  if (lines[0].includes('‼️The battle with ')) {
    return 'battlereport'
  }

  if (lines[0].includes('battle was all night')) {
    return 'patrolreport'
  }

  if (lines[0].includes('Our scouts found')) {
    return 'attackscout'
  }

  if (lines[0].includes('Your domain attacked')) {
    return 'attackincoming'
  }

  if (lines[0].includes('wants to enter your alliance.')) {
    return 'alliancejoinrequest'
  }

  if (lines[0].includes('complete. The siege is about to begin. In it will take part')) {
    return 'castleSiegeParticipants'
  }

  if ((content.includes('Will last until: ') || content.includes('Will continue: ')) &&
      EFFECTS_REGEX.test(lines[0])
  ) {
    return 'effects'
  }
}

function getScreenInformation(type, content) {
  switch (type) {
    case 'alliance-battlereport': return getBattlereportFromRaw(getRawBattlereport(content))
    case 'alliancejoinrequest': return getAllianceJoinRequest(content)
    case 'attackincoming': return getAttackIncoming(content)
    case 'attackscout': return getAttackScout(content)
    case 'battlereport': return getBattlereportFromRaw(getRawBattlereport(content))
    case 'buildings': return getBuildings(content)
    case 'castleSiegeParticipants': return getCastleSiegeParticipants(content)
    case 'effects': return getEffects(content)
    case 'main': return getMainResources(content)
    case 'resources': return getTradeResources(content)
    case 'storage': return getStorageResources(content)
    case 'war': return getWar(content)
    case 'workshop': return getWorkshopBuildings(content)
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

  const fullEnemy = regexHelper.get(content, /battle with (?:alliance )?([\s\S]+) complete/)
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
  const namePart = regexHelper.get(content, /Our scouts found ([\s\S]+) in his domain/)
  const {name} = gamescreenName.parse(namePart)

  return {attackscout: {
    player: name,
    karma: regexHelper.getNumber(content, `(\\d+)${emoji.karma}`),
    terra: regexHelper.getNumber(content, `(\\d+)${emoji.terra}`)
  }}
}

function getAttackIncoming(content) {
  const namePart = regexHelper.get(content, /attacked! ([\s\S]+) approaches/)
  const {name} = gamescreenName.parse(namePart)

  return {attackincoming: {
    player: name
  }}
}

function getAllianceJoinRequest(content) {
  const namePart = regexHelper.get(content, /^([\s\S]+) from /)
  const {name} = gamescreenName.parse(namePart)

  return {alliancejoinrequest: {
    player: name
  }}
}

function getWar(content) {
  const base = getWarMenuDomainStats(content)
  const result = {
    ...base
  }

  const battle = {}

  const namePart = regexHelper.get(content, /Continues the battle with (.+)/)
  const attack = regexHelper.get(content, /Attack: (.+)/)
  const defence = regexHelper.get(content, /Defence: (.+)/)

  if (attack && defence) {
    battle.attack = attack.split(', ')
    battle.defence = defence.split(', ')
  } else if (namePart) {
    const {name} = gamescreenName.parse(namePart)
    battle.enemy = name
  }

  if (Object.keys(battle).length > 0) {
    result.battle = battle
  }

  return result
}

module.exports = {
  detectType,
  getScreenInformation
}
