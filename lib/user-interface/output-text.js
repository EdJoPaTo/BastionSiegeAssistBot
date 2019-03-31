const moonmoji = require('moonmoji')

const {EMOJI: gamescreenEmoji} = require('bastion-siege-logic')

const emoji = {...gamescreenEmoji,
  ballista: gamescreenEmoji.dragon,
  gems: gamescreenEmoji.gem,
  language: '🏳️‍🌈',
  backTo: '↪️',
  poweruser: '💙',
  list: '📜',
  yes: '✅',
  no: '❌',
  warning: '⚠️',
  danger: '❗️',
  aging: '⏳',
  aged: '⌛️',
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
