import {EMOJI} from 'bastion-siege-logic'

const moonmoji = require('moonmoji')

export const emoji: Record<string, string> = {...EMOJI,
  ballista: EMOJI.dragon,
  gems: EMOJI.gem,
  language: '🏳️‍🌈',
  timezone: '🕑',
  backTo: '↪️',
  poweruser: '💙',
  alertDisabled: '🔕',
  alertEnabled: '🔔',
  buildingUpgrade: EMOJI.houses,
  effect: '✨',
  nextBattle: EMOJI.army,
  resourceWarning: EMOJI.food,
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
  activityUnclear: '🤬',
  inactive: '🌒', // Gets updated by updateInactiveEmoji()
  canned: '🥫',
  losslessBattle: '💤'
}

setInterval(updateInactiveEmoji, 1000 * 60 * 60) // Every hour
updateInactiveEmoji()
function updateInactiveEmoji(): void {
  emoji.inactive = moonmoji().emoji
}
