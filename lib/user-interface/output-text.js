const {emoji: gamescreenEmoji} = require('../input/game-text')

const emoji = {...gamescreenEmoji,
  ballista: gamescreenEmoji.dragon,
  backTo: '↪️',
  win: '🎉',
  lose: '😭'
}

module.exports = {
  emoji
}
