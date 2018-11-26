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
  army: '⚔', // Unicode 9876
  army2: '⚔️', // Unicode 9876 followed by 65039
  regexArmy: '⚔.?', // Works because army2 is the same emoji as army but followed by another one
  terra: '🗺'
}

const dragon = '🐲Dragon'
const undead = '☠️Undead army'

module.exports = {
  emoji,
  dragon,
  undead
}
