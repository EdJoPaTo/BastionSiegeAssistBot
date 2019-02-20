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
  /* eslint complexity: "off" */
  const lines = content.split('\n')

  if (content.includes('Сезон')) {
    return 'main'
  }

  if (lines[0].includes('Постройки')) {
    return 'buildings'
  }

  if (lines[0].includes('Склад')) {
    return 'storage'
  }

  if (lines[0].includes('Мастерская')) {
    return 'workshop'
  }

  if (lines[0].includes('Требушет')) {
    return 'trebuchet'
  }

  if (lines[0].includes('Ресурсы')) {
    return 'resources'
  }

  if (lines[0].includes('Победы')) {
    return 'war'
  }

  if (lines[0].includes('‼️Битва с ')) {
    return 'battlereport'
  }

  if (lines[0].includes('Завязалась кровавая битва')) {
    return 'patrolreport'
  }

  if (lines[0].includes('Разведчики докладывают')) {
    return 'attackscout'
  }

  if (lines[0].includes('Твои владения атакованы')) {
    return 'attackincoming'
  }

  if (lines[0].includes(' союзник') &&
      lines[0].includes(' атаковал ') &&
      lines[0].includes(' Ты можешь ')) {
    return 'allianceBattleStart'
  }

  if (lines[0].includes(' присоединилась к ')) {
    return 'allianceBattleSupport'
  }

  if (lines[0].includes('В твой альянс желает вступить')) {
    return 'alliancejoinrequest'
  }

  if (lines[0].includes('окончено. Осада вот-вот начнется. В ней примут участие')) {
    return 'castleSiegeParticipants'
  }

  if ((content.includes('Продлится до: ') || content.includes('Продлится еще: ')) &&
      EFFECTS_REGEX.test(lines[0])
  ) {
    return 'effects'
  }
}

function getScreenInformation(type, content) {
  switch (type) {
    case 'alliance-battlereport': return getBattlereportFromRaw(getRawBattlereport(content))
    case 'allianceBattleStart': return getAllianceBattleStart(content)
    case 'allianceBattleSupport': return getAllianceBattleSupport(content)
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

  const fullEnemy = regexHelper.get(content, /Битва с (?:альянсом )?([\s\S]+) окончена/)
  const enemy = gamescreenName.parse(fullEnemy)
  raw.enemy = enemy.name
  raw.enemyAlliance = enemy.alliance

  const winners = regexHelper.get(content, /Победители: (.+)/)
  const losers = regexHelper.get(content, /Проигравшие: (.+)/)

  if (winners) {
    raw.winners = winners.split(', ')
    raw.losers = losers.split(', ')
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
  const namePart = regexHelper.get(content, /расположился ([\s\S]+) в своих владениях/)
  const {name} = gamescreenName.parse(namePart)

  return {attackscout: {
    player: name,
    karma: regexHelper.getNumber(content, `(\\d+)${emoji.karma}`),
    terra: regexHelper.getNumber(content, `(\\d+)${emoji.terra}`)
  }}
}

function getAttackIncoming(content) {
  const namePart = regexHelper.get(content, /атакованы! ([\s\S]+) подступает/)
  const {name} = gamescreenName.parse(namePart)

  return {attackincoming: {
    player: name
  }}
}

function getAllianceBattleStart(content) {
  const regex = /союзник.? (.+) атаковал (.+) из /
  const ally = gamescreenName.parse(regexHelper.get(content, regex, 1))
  const enemy = gamescreenName.parse(regexHelper.get(content, regex, 2))
  return {allianceBattleStart: {
    ally: ally.name,
    enemy: enemy.name
  }}
}

function getAllianceBattleSupport(content) {
  const namePart = regexHelper.get(content, /🕊..?Армия (.+) присоединилась к /)
  const {name} = gamescreenName.parse(namePart)
  return {allianceBattleSupport: {
    player: name
  }}
}

function getAllianceJoinRequest(content) {
  const namePart = regexHelper.get(content, /желает вступить ([\s\S]+) из/)
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

  const namePart = regexHelper.get(content, /Продолжается бой с (.+)/)
  const attack = regexHelper.get(content, /Атака: (.+)/)
  const defence = regexHelper.get(content, /Защита: (.+)/)

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
