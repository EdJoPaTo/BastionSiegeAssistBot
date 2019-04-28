const Telegraf = require('telegraf')

const {getUnicode} = require('../lib/javascript-abstraction/strings')

const {whenScreenContainsInformation} = require('../lib/input/gamescreen')

const playerStatsDb = require('../lib/data/playerstats-db')
const poweruser = require('../lib/data/poweruser')
const wars = require('../lib/data/wars')

const {createPlayerShareButton, createPlayerStatsString, createPlayerStatsTwoLineString, createMultipleStatsConclusion} = require('../lib/user-interface/player-stats')

const {notNewMiddleware} = require('../lib/telegraf-middlewares')

const {Extra, Markup} = Telegraf

const bot = new Telegraf.Composer()

bot.on('text', whenScreenContainsInformation('attackIncoming', notNewMiddleware('battle.over'), ctx => {
  const {attackIncoming} = ctx.state.screen
  const {text, extra} = generatePlayerStats(attackIncoming.name)
  return ctx.reply(text, extra)
}))

bot.on('text', whenScreenContainsInformation('attackscout', notNewMiddleware('battle.scoutsGone', 2), ctx => {
  const {attackscout} = ctx.state.screen
  const {name} = attackscout.player

  const possible = playerStatsDb.getLookingLike(name)

  let prefix = ''
  prefix += 'Search: '
  prefix += getUnicode(name).join(' ')
  prefix += '\n\n'

  const {text, extra} = generatePlayerStats(possible.map(o => o.player))

  // TODO: fix collective attack
  /*
  const keyboard = Markup.inlineKeyboard([
    Markup.switchToChatButton(ctx.i18n.t('list.shareAttack'), 'list')
  ])
  /**/

  return ctx.reply(prefix + text, extra)
}))

bot.on('text', whenScreenContainsInformation('allianceBattleStart', notNewMiddleware('battle.over'), async ctx => {
  const {allianceBattleStart, timestamp} = ctx.state.screen
  const battle = allianceBattleStart.attack ?
    {attack: [allianceBattleStart.ally.name], defence: [allianceBattleStart.enemy.name]} :
    {attack: [allianceBattleStart.enemy.name], defence: [allianceBattleStart.ally.name]}

  await wars.add(timestamp, battle)

  let text = ''
  text += ctx.i18n.t('battle.inlineWar.updated')
  text += '\n\n'

  const {text: statsText, extra} = generatePlayerStats(allianceBattleStart.enemy.name)
  text += statsText

  return ctx.reply(text, extra)
}))

bot.on('text', whenScreenContainsInformation('allianceBattleSupport', notNewMiddleware('battle.over'), ctx => {
  const {allianceBattleSupport} = ctx.state.screen
  const {text, extra} = generatePlayerStats(allianceBattleSupport.name)
  return ctx.reply(text, extra)
}))

bot.on('text', whenScreenContainsInformation('allianceJoinRequest', notNewMiddleware(), ctx => {
  const {allianceJoinRequest} = ctx.state.screen
  const {text, extra} = generatePlayerStats(allianceJoinRequest.name)
  return ctx.reply(text, extra)
}))

bot.on('text', whenScreenContainsInformation('list', notNewMiddleware('forward.old'), ctx => {
  if (!poweruser.isPoweruser(ctx.from.id)) {
    return ctx.replyWithMarkdown(ctx.i18n.t('poweruser.usefulWhen'))
  }

  const {list} = ctx.state.screen
  const names = list.map(o => o.name)

  if (names.length === 0) {
    return ctx.reply('not players…')
  }

  const {text, extra} = generatePlayerStats(names, true)
  return ctx.reply(text, extra)
}))

bot.on('text', whenScreenContainsInformation('castleSiegeParticipants', notNewMiddleware('forward.old', 60), ctx => {
  let text = `*${ctx.i18n.t('bs.siege')}*\n`
  if (!poweruser.isPoweruser(ctx.from.id)) {
    text += ctx.i18n.t('poweruser.usefulWhen')
    return ctx.replyWithMarkdown(text)
  }

  const {castleSiegeParticipants} = ctx.state.screen
  text += castleSiegeParticipants
    .filter(o => o.players.length >= 5)
    .map(o => o.players.map(player => playerStatsDb.get(player)))
    .map(o => createMultipleStatsConclusion(o).armyString)
    .join('\n')

  return ctx.replyWithMarkdown(text)
}))

function generatePlayerStats(players, short = false) {
  if (!Array.isArray(players)) {
    players = [players]
  }

  const allStats = players
    .map(o => playerStatsDb.get(o))
  const buttons = allStats.map(o => createPlayerShareButton(o))

  let text = ''
  if (short) {
    text += allStats.map(o => createPlayerStatsTwoLineString(o, true)).join('\n')
  } else {
    text += allStats.map(o => createPlayerStatsString(o)).join('\n\n')
  }

  return {
    text,
    extra: Extra.markdown().markup(Markup.inlineKeyboard(buttons, {columns: 2}))
  }
}

module.exports = {
  bot
}
