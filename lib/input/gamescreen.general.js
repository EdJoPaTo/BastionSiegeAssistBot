const {isMystic, parsePlayer} = require('bastion-siege-logic')

const regexHelper = require('../javascript-abstraction/regex-helper')
const {emoji} = require('./game-text')

function getBuildings(content) {
  return {buildings: {
    townhall: regexHelper.getNumber(content, `${emoji.townhall}\\s+(\\d+)`),
    storage: regexHelper.getNumber(content, `${emoji.storage}\\s+(\\d+)`),
    houses: regexHelper.getNumber(content, `${emoji.houses}\\s+(\\d+)`),
    farm: regexHelper.getNumber(content, `${emoji.farm}\\s+(\\d+)`),
    sawmill: regexHelper.getNumber(content, `${emoji.sawmill}\\s+(\\d+)`),
    mine: regexHelper.getNumber(content, `${emoji.mine}\\s+(\\d+)`),
    barracks: regexHelper.getNumber(content, `${emoji.barracks}\\s+(\\d+)`),
    wall: regexHelper.getNumber(content, `${emoji.wall}\\s+(\\d+)`)
  }}
}

function getMainResources(content) {
  const firstLine = content.split('\n')[0].trim()
  return {
    player: parsePlayer(firstLine),
    resources: {
      gold: regexHelper.getNumber(content, `(\\d+)${emoji.gold}`),
      wood: regexHelper.getNumber(content, `(\\d+)${emoji.wood}`),
      stone: regexHelper.getNumber(content, `(\\d+)${emoji.stone}`),
      food: regexHelper.getNumber(content, `(\\d+)${emoji.food}`)
    }
  }
}

function getTradeResources(content) {
  return {resources: {
    gold: regexHelper.getNumber(content, `(\\d+)${emoji.gold}`),
    wood: regexHelper.getNumber(content, `(\\d+)${emoji.wood}`),
    stone: regexHelper.getNumber(content, `(\\d+)${emoji.stone}`),
    food: regexHelper.getNumber(content, `(\\d+)${emoji.food}`)
  }}
}

function getBattlereportFromRaw(raw) {
  const battlereport = {}

  battlereport.won = raw.won

  // XOR: when terra & won -> attack, when no terra and lost -> attack
  battlereport.attack = (raw.terra > 0 && raw.won) ||
    (raw.terra === 0 && !raw.won)

  const mystic = isMystic(raw.enemy)
  if (mystic) {
    battlereport.attack = false
    battlereport.enemyMystic = mystic
  }

  const lossNegation = raw.won ? 1 : -1
  battlereport.gold = (raw.gold * lossNegation) || 0

  if (raw.gems) {
    battlereport.gems = raw.gems
  }

  if (raw.terra) {
    battlereport.terra = raw.terra * lossNegation
  }

  if ((battlereport.attack && battlereport.won) || raw.karma) {
    battlereport.karma = raw.karma || 0
  }

  if (raw.enemyAlliance) {
    battlereport.enemyAlliance = raw.enemyAlliance
  }

  if (raw.won) {
    battlereport.enemies = raw.losers || [raw.enemy]
    battlereport.friends = raw.winners || [raw.me]
  } else {
    battlereport.enemies = raw.winners || [raw.enemy]
    battlereport.friends = raw.losers || [raw.me]
  }

  battlereport.soldiersAlive = raw.soldiersAlive
  battlereport.soldiersTotal = raw.soldiersTotal

  return {battlereport}
}

function getBattlereportBasicRaw(content) {
  const raw = {}

  raw.gold = regexHelper.getNumber(content, `(\\d+)${emoji.gold}`) || 0
  raw.gems = regexHelper.getNumber(content, `(\\d+)${emoji.gem}`)
  raw.terra = regexHelper.getNumber(content, `(\\d+)${emoji.terra}`) || 0
  raw.karma = regexHelper.getNumber(content, `(-?\\d+)${emoji.karma}`)

  return raw
}

const EFFECTS_REGEX = /(.+) -\s+([^.]+)\./
function getEffects(content) {
  const lines = content.split('\n')

  const effects = lines
    .map(line => {
      const emoji = regexHelper.get(line, EFFECTS_REGEX, 1)
      const name = regexHelper.get(line, EFFECTS_REGEX, 2)
      const result = {
        emoji,
        name
      }

      const minutesRemaining = regexHelper.getNumber(line, /: (\d+) [^.]+\./)
      const timestampString = regexHelper.get(line, /(\d[\d-: ]+ \+0000 UTC)/)

      if (timestampString) {
        result.timestamp = Date.parse(timestampString) / 1000
      } else if (minutesRemaining) {
        result.minutesRemaining = minutesRemaining
      }

      return result
    })

  return {effects}
}

function getWarMenuDomainStats(content) {
  const domainStats = {}

  domainStats.karma = regexHelper.getNumber(content, `(-?\\d+)${emoji.karma}`) || 0
  domainStats.terra = regexHelper.getNumber(content, `(\\d+)${emoji.terra}`) || 0
  domainStats.wins = regexHelper.getNumber(content, `(\\d+)${emoji.wins}`) || 0

  return {domainStats}
}

function getCastleSiegeParticipants(content) {
  const lines = content
    .split('\n')
    .map(o => o.trim())
  const alliances = []
  for (const line of lines) {
    if (line.startsWith('[')) {
      const namePart = regexHelper.get(line, /^(\[[^\]]+\][^(]+)(?: \(\d+\))?$/)
      const {alliance, name} = parsePlayer(namePart)
      alliances.push({
        alliance,
        name,
        players: []
      })
    } else if (line.startsWith('-')) {
      const {name} = parsePlayer(line.slice(2))
      alliances[alliances.length - 1].players.push(name)
    }
  }

  return {castleSiegeParticipants: alliances}
}

module.exports = {
  EFFECTS_REGEX,
  getBattlereportBasicRaw,
  getBattlereportFromRaw,
  getBuildings,
  getCastleSiegeParticipants,
  getEffects,
  getMainResources,
  getTradeResources,
  getWarMenuDomainStats
}
