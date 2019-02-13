const moonmoji = require('moonmoji')

const {emoji: gamescreenEmoji} = require('../input/game-text')

const emoji = {...gamescreenEmoji,
  ballista: gamescreenEmoji.dragon,
  gems: gamescreenEmoji.gem,
  language: '🏳️‍🌈',
  backTo: '↪️',
  poweruser: '💙',
  immunity: '🛡',
  battlereport: '🔭',
  win: '🎉',
  lose: '😭',
  active: '🌞',
  inactive: '🌒', // Gets updated by updateInactiveEmoji()
  losslessBattle: '💤'
}

setInterval(updateInactiveEmoji, 1000 * 60 * 60) // Every hour
updateInactiveEmoji()
function updateInactiveEmoji() {
  emoji.inactive = moonmoji().emoji
}

module.exports = {
  emoji
}
