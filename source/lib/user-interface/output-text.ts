import {EMOJI} from 'bastion-siege-logic'

const moonmoji = require('moonmoji')

type Dictionary<T> = {[key: string]: T}

export const emoji: Dictionary<string> = {...EMOJI,
  ballista: EMOJI.dragon,
  gems: EMOJI.gem,
  language: '🏳️‍🌈',
  backTo: '↪️',
  poweruser: '💙',
  alliance: '👥',
  solo: '👤',
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
function updateInactiveEmoji(): void {
  emoji.inactive = moonmoji().emoji
}

module.exports = {
  emoji
}
