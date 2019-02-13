const {emoji: gamescreenEmoji} = require('../input/game-text')

const emoji = {...gamescreenEmoji,
  ballista: gamescreenEmoji.dragon,
  gems: gamescreenEmoji.gem,
  backTo: '↪️',
  poweruser: '💙',
  immunity: '🛡',
  win: '🎉',
  lose: '😭'
}

module.exports = {
  emoji
}
