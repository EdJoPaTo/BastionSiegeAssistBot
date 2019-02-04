const {emoji: gamescreenEmoji} = require('../input/game-text')

const emoji = {...gamescreenEmoji,
  ballista: gamescreenEmoji.dragon,
  gems: gamescreenEmoji.gem,
  backTo: '↪️',
  win: '🎉',
  lose: '😭'
}

module.exports = {
  emoji
}
