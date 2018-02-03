const emoji = {
  gold: '💰',
  wood: '🌲',
  stone: '⛏',
  food: '🍖',
  townhall: '🏤',
  storage: '🏚',
  houses: '🏘',
  farm: '🌻',
  sawmill: '🌲',
  mine: '⛏',
  barracks: '🛡',
  wall: '🏰',
  trebuchet: '⚔️'
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
  if (lines[0].indexOf('Resources') >= 0) {
    return 'resources'
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
    default: return {}
  }
}

function getBuildings(content) {
  return {
    townhall: getNumberFromRegExpPattern(content, `${emoji.townhall}\\s+(\\d+)`),
    storage: getNumberFromRegExpPattern(content, `${emoji.storage}\\s+(\\d+)`),
    houses: getNumberFromRegExpPattern(content, `${emoji.houses}\\s+(\\d+)`),
    farm: getNumberFromRegExpPattern(content, `${emoji.farm}\\s+(\\d+)`),
    sawmill: getNumberFromRegExpPattern(content, `${emoji.sawmill}\\s+(\\d+)`),
    mine: getNumberFromRegExpPattern(content, `${emoji.mine}\\s+(\\d+)`),
    barracks: getNumberFromRegExpPattern(content, `${emoji.barracks}\\s+(\\d+)`),
    wall: getNumberFromRegExpPattern(content, `${emoji.wall}\\s+(\\d+)`)
  }
}

function getWorkshopBuildings(content) {
  return {
    trebuchet: getNumberFromRegExpPattern(content, `${emoji.trebuchet}\\D+(\\d+)`)
  }
}

function getMainResources(content) {
  return {
    gold: getNumberFromRegExpPattern(content, `(\\d+)${emoji.gold}`),
    wood: getNumberFromRegExpPattern(content, `(\\d+)${emoji.wood}`),
    stone: getNumberFromRegExpPattern(content, `(\\d+)${emoji.stone}`),
    food: getNumberFromRegExpPattern(content, `(\\d+)${emoji.food}`)
  }
}

function getStorageResources(content) {
  return {
    gold: getNumberFromRegExpPattern(content, `Gold\\s+(\\d+)${emoji.gold}`),
    wood: getNumberFromRegExpPattern(content, `(\\d+)/\\d+${emoji.wood}`),
    stone: getNumberFromRegExpPattern(content, `(\\d+)/\\d+${emoji.stone}`),
    food: getNumberFromRegExpPattern(content, `(\\d+)/\\d+${emoji.food}`)
  }
}

function getTradeResources(content) {
  return {
    gold: getNumberFromRegExpPattern(content, `(\\d+)${emoji.gold}`),
    wood: getNumberFromRegExpPattern(content, `(\\d+)${emoji.wood}`),
    stone: getNumberFromRegExpPattern(content, `(\\d+)${emoji.stone}`),
    food: getNumberFromRegExpPattern(content, `(\\d+)${emoji.food}`)
  }
}

function getNumberFromRegExpPattern(text, pattern) {
  const regex = new RegExp(pattern)
  const match = regex.exec(text)
  const group1 = Number(match[1])

  return group1
}

module.exports = {
  detectgamescreen: detectgamescreen,
  getScreenInformation: getScreenInformation
}
