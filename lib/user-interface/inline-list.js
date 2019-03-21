const {Markup} = require('telegraf')
const {calcBarracksCapacity, nextBattleTimestamp} = require('bastion-siege-logic')

const poweruser = require('../data/poweruser')
const userSessions = require('../data/user-sessions')

const {createPlayerNameString} = require('./player-stats')
const {emoji} = require('./output-text')
const {formatNumberShort, formatTimeAmount} = require('./format-number')

function createList(userIds, now) {
  let text = ''

  if (userIds.length === 0) {
    text += '👻 Its lonely…'
  }

  const entries = userIds
    .map(o => ({
      id: o,
      session: userSessions.getUser(o)
    }))
    .map(({id, session}) => getEntryInformation(id, session))

  const totalArmy = entries
    .map(o => calcBarracksCapacity(o.barracks))
    .reduce((a, b) => a + b, 0)

  const nextAllianceAttack = Math.max(
    ...entries.map(o => o.nextAllianceAttack)
  )
  const secondsUntilNextAllianceAttack = nextAllianceAttack - now

  const statsLine = []
  statsLine.push(`${formatNumberShort(totalArmy, true)}${emoji.army}`)
  statsLine.push(`≤${formatNumberShort(totalArmy * 500, true)}${emoji.gold}`)

  if (secondsUntilNextAllianceAttack > 0) {
    statsLine.push(formatTimeAmount(secondsUntilNextAllianceAttack / 60))
  }

  if (statsLine.length > 0 && userIds.length > 0) {
    text += statsLine.join('  ') + '\n\n'
  }

  text += entries
    .map(o => createEntryString(o, now))
    .join('\n')

  const keyboard = Markup.inlineKeyboard([
    Markup.callbackButton('➕ Join', 'inlineList:join'),
    Markup.callbackButton('➖ Leave', 'inlineList:leave', userIds.length === 0)
  ])

  return {text, keyboard}
}

function getEntryInformation(userId, session) {
  const information = session.gameInformation

  const {battleSoloTimestamp, battleAllianceTimestamp, domainStats} = information
  const {karma} = domainStats || {}
  const nextAllianceAttack = nextBattleTimestamp(battleSoloTimestamp, battleAllianceTimestamp, karma).alliance

  return {
    player: information.player.name,
    alliance: information.player.alliance,
    isPoweruser: poweruser.isPoweruser(userId),
    nextAllianceAttack,
    barracks: information.buildings.barracks || 0,
    trebuchet: (information.workshop || {}).trebuchet
  }
}

function createEntryString(information, now) {
  const {isPoweruser, barracks, trebuchet} = information
  const parts = []
  parts.push(`${barracks}${emoji.barracks}`)
  if (trebuchet) {
    parts.push(`${trebuchet}${emoji.trebuchet}`)
  }

  if (isPoweruser) {
    parts.push(emoji.poweruser)
  }

  parts.push(createPlayerNameString(information, true))

  const secondsUntilNextAllianceAttack = information.nextAllianceAttack - now
  if (secondsUntilNextAllianceAttack > 0) {
    parts.push(formatTimeAmount(secondsUntilNextAllianceAttack / 60))
  }

  return parts.join(' ')
}

module.exports = {
  createList
}
