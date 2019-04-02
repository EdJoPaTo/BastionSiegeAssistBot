const {MYSTICS_TEXT_EN} = require('bastion-siege-logic')

const emoji = {
  gold: '💰',
  wood: '🌲',
  stone: '⛏',
  food: '🍖',
  gem: '💎',
  karma: '☯',
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
  people: '👥',
  castle: '🏰',
  army: '⚔', // Unicode 9876
  army2: '⚔️', // Unicode 9876 followed by 65039
  regexArmy: '⚔.?', // Works because army2 is the same emoji as army but followed by another one
  wins: '🎖',
  terra: '🗺',
  dragon: '🐲',
  undead: '☠'
}

const mystics = Object.values(MYSTICS_TEXT_EN)

module.exports = {
  emoji,
  mystics
}
