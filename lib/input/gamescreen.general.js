const regexHelper = require('../javascript-abstraction/regex-helper')
const {emoji} = require('./game-text')
const gamescreenName = require('./gamescreen-name')

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
  const firstLine = content.split('\n')[0]
  return {
    player: gamescreenName.parse(firstLine),
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

  if (gamescreenName.isDragonOrUndead(raw.enemy)) {
    battlereport.attack = false
  }

  const lossNegation = raw.won ? 1 : -1
  battlereport.reward = (raw.gold * lossNegation) || 0
  if (raw.gems) {
    battlereport.gems = raw.gems
  }
  if (raw.terra) {
    battlereport.terra = raw.terra * lossNegation
  }
  if (battlereport.attack && battlereport.won) {
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
  raw.karma = regexHelper.getNumber(content, `(\\d+)${emoji.karma}`)

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

module.exports = {
  EFFECTS_REGEX,
  getBuildings,
  getMainResources,
  getTradeResources,
  getBattlereportFromRaw,
  getBattlereportBasicRaw,
  getEffects
}
