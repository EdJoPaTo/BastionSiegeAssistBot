const {Markup} = require('telegraf')
const {calcBarracksCapacity, nextBattleTimestamp} = require('bastion-siege-logic')

const {sortBy} = require('../javascript-abstraction/array')

const lists = require('../data/inline-lists')
const playerStatsDb = require('../data/playerstats-db')
const poweruser = require('../data/poweruser')
const userSessions = require('../data/user-sessions')

const {createPlayerNameString, createPlayerStatsString} = require('./player-stats')
const {emoji} = require('./output-text')
const {formatNumberShort, formatTimeAmount} = require('./format-number')

const ATTACK_SCOUT_MAX_AGE = 60 * 15 // 15 min

function createList(creatorId, listId, now) {
  const list = lists.getList(creatorId, listId, now)
  const {participants} = list

  const entries = Object.keys(participants)
    .map(o => Number(o))
    .map(id => getEntryInformation(id, participants[id], userSessions.getUser(id)))
    .sort(sortBy(o => o.barracks, true))

  let text = ''

  text += emoji.poweruser + emoji.list + ' *List*\n'
  const statsLine = createStatsLine(entries, now)
  if (statsLine.length > 0) {
    text += statsLine.join('  ')
    text += '\n'
  }

  text += '\n'
  if (entries.length === 0) {
    text += '👻 Its lonely…'
  }

  text += entries
    .map(o => createEntryString(o, now))
    .join('\n')

  text += '\n\n'

  const creatorSession = userSessions.getUser(creatorId)
  const {attackscout, attackscoutTimestamp} = creatorSession.gameInformation
  if (attackscoutTimestamp && attackscoutTimestamp > now - ATTACK_SCOUT_MAX_AGE) {
    const {player} = attackscout
    const stats = playerStatsDb.get(player)
    text += createPlayerStatsString(stats)
    text += '\n\n'
  }

  const buttonPrefix = `inlineList:${creatorId}:${listId}:`
  const keyboard = Markup.inlineKeyboard([
    Markup.callbackButton('➕ Join', buttonPrefix + 'join:'),
    Markup.callbackButton('➖ Leave', buttonPrefix + 'leave', Object.keys(participants).length === 0)
  ])

  return {text, keyboard}
}

function createStatsLine(entries, now) {
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

  return statsLine
}

function getEntryInformation(userId, listEntry, session) {
  const information = session.gameInformation

  const {battleSoloTimestamp, battleAllianceTimestamp, domainStats} = information
  const {karma} = domainStats || {}
  const nextAllianceAttack = nextBattleTimestamp(battleSoloTimestamp, battleAllianceTimestamp, karma).alliance

  return {
    player: information.player.name,
    alliance: information.player.alliance,
    isPoweruser: poweruser.isPoweruser(userId),
    lastUpdate: listEntry.lastUpdate,
    nextAllianceAttack,
    barracks: information.buildings.barracks || 0,
    trebuchet: (information.workshop || {}).trebuchet
  }
}

function createEntryString(information, now) {
  const {barracks, trebuchet} = information
  const parts = []
  parts.push(`${barracks}${emoji.barracks}`)
  if (trebuchet) {
    parts.push(`${trebuchet}${emoji.trebuchet}`)
  }

  const updateAgo = now - information.lastUpdate
  if (updateAgo > lists.PARTICIPANT_MAX_AGE * (2 / 3)) {
    parts.push(emoji.aged)
  } else if (updateAgo > lists.PARTICIPANT_MAX_AGE * (1 / 3)) {
    parts.push(emoji.aging)
  }

  if (information.isPoweruser) {
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
