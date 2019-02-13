const {emoji: gamescreenEmoji} = require('../input/game-text')

const emoji = {...gamescreenEmoji,
  ballista: gamescreenEmoji.dragon,
  gems: gamescreenEmoji.gem,
  backTo: '↪️',
  poweruser: '💙',
  immunity: '🛡',
  battlereport: '📜',
  win: '🎉',
  lose: '😭',
  active: '😡',
  inactive: '💤'
}

module.exports = {
  emoji
}
