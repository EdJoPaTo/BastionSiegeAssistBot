const regexHelper = require('./regex-helper')

const emoji = {
  gold: '💰',
  wood: '🌲',
  stone: '⛏',
  food: '🍖',
  gem: '💎',
  townhall: '🏤',
  storage: '🏚',
  houses: '🏘',
  farm: '🌻',
  sawmill: '🌲',
  mine: '⛏',
  barracks: '🛡',
  wall: '🏰',
  trebuchet: '⚔',
  ballista: '⚔',
  army: '⚔', // Unicode 9876
  army2: '⚔️', // Unicode 9876 followed by 65039
  regexArmy: '⚔.?', // Works because army2 is the same emoji as army but followed by another one
  terra: '🗺'
}

function detectgamescreen(content) {
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
  if (lines[0].indexOf('battle with alliance') >= 0) {
    return 'alliance-battlereport'
  }
  if (lines[0].indexOf('battle with') >= 0) {
    return 'battlereport'
  }
  if (lines[0].indexOf('battle was all night') >= 0) {
    return 'patrolreport'
  }

  return 'unknown'
}

function getScreenInformation(content) {
  const type = detectgamescreen(content)

  switch (type) {
    case 'buildings': return getBuildings(content)
    case 'workshop': return getWorkshopBuildings(content)
    case 'main': return getMainResources(content)
    case 'storage': return getStorageResources(content)
    case 'resources': return getTradeResources(content)
    case 'alliance-battlereport': return getBattlereport(content)
    case 'battlereport': return getBattlereport(content)
    default: return {}
  }
}

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

function getWorkshopBuildings(content) {
  return {workshop: {
    trebuchet: regexHelper.getNumber(content, `${emoji.trebuchet}Trebuchet\\s+(\\d+)`),
    ballista: regexHelper.getNumber(content, `${emoji.ballista}Ballista\\s+(\\d+)`)
  }}
}

function getMainResources(content) {
  return {resources: {
    gold: regexHelper.getNumber(content, `(\\d+)${emoji.gold}`),
    wood: regexHelper.getNumber(content, `(\\d+)${emoji.wood}`),
    stone: regexHelper.getNumber(content, `(\\d+)${emoji.stone}`),
    food: regexHelper.getNumber(content, `(\\d+)${emoji.food}`)
  }}
}

function getStorageResources(content) {
  return {resources: {
    gold: regexHelper.getNumber(content, `Gold\\s+(\\d+)${emoji.gold}`),
    wood: regexHelper.getNumber(content, `(\\d+)/\\d+${emoji.wood}`),
    stone: regexHelper.getNumber(content, `(\\d+)/\\d+${emoji.stone}`),
    food: regexHelper.getNumber(content, `(\\d+)/\\d+${emoji.food}`)
  }}
}

function getTradeResources(content) {
  return {resources: {
    gold: regexHelper.getNumber(content, `(\\d+)${emoji.gold}`),
    wood: regexHelper.getNumber(content, `(\\d+)${emoji.wood}`),
    stone: regexHelper.getNumber(content, `(\\d+)${emoji.stone}`),
    food: regexHelper.getNumber(content, `(\\d+)${emoji.food}`)
  }}
}

function getBattlereport(content) {
  const battlereport = {}
  battlereport.won = /Your army won/.test(content)
  let me
  if (battlereport.won) {
    me = regexHelper.get(content, /Congratulations, ([^!]+)!/)
  } else {
    me = regexHelper.get(content, /Unfortunately, ([^,]+), your army lose./)
  }
  battlereport.friends = [me]

  const reward = regexHelper.getNumber(content, `Your reward is (\\d+)${emoji.gold}`) ||
    regexHelper.getNumber(content, `jewels worth a (\\d+)${emoji.gold}`) ||
    0
  const loss = regexHelper.getNumber(content, `You lose (\\d+)${emoji.gold}`)
  battlereport.reward = loss ? -1 * loss : reward

  const terraMy = regexHelper.getNumber(content, `(\\d+)${emoji.terra} joined to your domain`)
  const terraEnemy = regexHelper.getNumber(content, `(\\d+)${emoji.terra} joined to`)

  if (terraMy) {
    if (battlereport.reward >= 0) {
      battlereport.attack = true
      battlereport.terra = terraMy
    } else {
      throw new Error('unknown attack situation')
    }
  } else if (terraEnemy) {
    if (battlereport.reward < 0) {
      battlereport.attack = false
      battlereport.terra = -1 * terraEnemy
    } else {
      throw new Error('unknown attack situation')
    }
  } else {
    battlereport.attack = battlereport.reward < 0
  }

  if (battlereport.attack) {
    battlereport.karma = regexHelper.getNumber(content, /Your karma has been modified by (\d+)/) || 0
  }

  const gems = regexHelper.getNumber(content, `(\\d+)${emoji.gem}`)
  if (gems) {
    battlereport.gems = gems
  }

  let winners = regexHelper.get(content, /Winners: (.+)/)
  let losers = regexHelper.get(content, /Losers: (.+)/)

  if (winners) {
    winners = winners.split(', ')
    losers = losers.split(', ')
    if (battlereport.won) {
      battlereport.enemies = losers
      battlereport.friends = winners
    } else {
      battlereport.enemies = winners
      battlereport.friends = losers
    }
  } else {
    const enemy = regexHelper.get(content, /battle with (😈)?(?:{([^}]+)})?(?:\[([^\]]+)\])?(.+) complete/, 4)
    battlereport.enemies = [enemy]
  }

  const soldiersMatch = new RegExp(`(\\d+)${emoji.regexArmy} of (\\d+)${emoji.regexArmy}`).exec(content)
  const noneOf = regexHelper.getNumber(content, `None of the (\\d+)${emoji.regexArmy}`)
  const withoutLoss = regexHelper.getNumber(content, `(\\d+)${emoji.regexArmy} without a loss`)
  if (soldiersMatch) {
    battlereport.soldiersAlive = Number(soldiersMatch[1])
    battlereport.soldiersTotal = Number(soldiersMatch[2])
  } else if (noneOf !== undefined) {
    battlereport.soldiersAlive = 0
    battlereport.soldiersTotal = noneOf
  } else if (withoutLoss) {
    battlereport.soldiersAlive = withoutLoss
    battlereport.soldiersTotal = withoutLoss
  } else {
    throw new Error('soldiers unknown')
  }

  return {battlereport}
}

module.exports = {
  emoji,
  detectgamescreen,
  getScreenInformation
}
