const Telegraf = require('telegraf')

const {whenScreenContainsInformation} = require('../lib/input/gamescreen')

const playerStatsDb = require('../lib/data/playerstats-db')
const poweruser = require('../lib/data/poweruser')
const wars = require('../lib/data/wars')

const {createPlayerShareButton, createPlayerStatsString, createPlayerStatsTwoLineString, createMultipleStatsConclusion} = require('../lib/user-interface/player-stats')

const {notNewMiddleware} = require('../lib/telegraf-middlewares')

const {Extra, Markup} = Telegraf

const bot = new Telegraf.Composer()

bot.on('text', whenScreenContainsInformation('attackincoming', notNewMiddleware('battle.over'), ctx => {
  const {attackincoming} = ctx.state.screen.information
  const {text, extra} = generatePlayerStats(attackincoming.player)
  return ctx.reply(text, extra)
}))

bot.on('text', whenScreenContainsInformation('attackscout', notNewMiddleware('battle.scoutsGone', 2), ctx => {
  const {attackscout} = ctx.state.screen.information
  const {text} = generatePlayerStats(attackscout.player)

  const keyboard = Markup.inlineKeyboard([
    Markup.switchToChatButton(ctx.i18n.t('list.shareAttack'), 'list')
  ])

  return ctx.reply(text, Extra.markdown().markup(keyboard))
}))

bot.on('text', whenScreenContainsInformation('allianceBattleStart', notNewMiddleware('battle.over'), async ctx => {
  const {timestamp} = ctx.state.screen
  const {allianceBattleStart} = ctx.state.screen.information
  const battle = allianceBattleStart.attack ?
    {attack: [allianceBattleStart.ally], defence: [allianceBattleStart.enemy]} :
    {attack: [allianceBattleStart.enemy], defence: [allianceBattleStart.ally]}

  await wars.add(timestamp, battle)

  let text = ''
  text += ctx.i18n.t('battle.inlineWar.updated')
  text += '\n\n'

  const {text: statsText, extra} = generatePlayerStats(allianceBattleStart.enemy)
  text += statsText

  return ctx.reply(text, extra)
}))

bot.on('text', whenScreenContainsInformation('allianceBattleSupport', notNewMiddleware('battle.over'), ctx => {
  const {allianceBattleSupport} = ctx.state.screen.information
  const {text, extra} = generatePlayerStats(allianceBattleSupport.player)
  return ctx.reply(text, extra)
}))

bot.on('text', whenScreenContainsInformation('alliancejoinrequest', notNewMiddleware(), ctx => {
  const {alliancejoinrequest} = ctx.state.screen.information
  const {text, extra} = generatePlayerStats(alliancejoinrequest.player)
  return ctx.reply(text, extra)
}))

bot.on('text', whenScreenContainsInformation('castleSiegeParticipants', notNewMiddleware('forward.old', 60), ctx => {
  let text = `*${ctx.i18n.t('bs.siege')}*\n`
  if (!poweruser.isPoweruser(ctx.from.id)) {
    text += ctx.i18n.t('poweruser.usefulWhen')
    return ctx.replyWithMarkdown(text)
  }

  const {castleSiegeParticipants} = ctx.state.screen.information
  text += castleSiegeParticipants
    .filter(o => o.players.length >= 5)
    .map(o => o.players.map(player => playerStatsDb.get(player)))
    .map(o => createMultipleStatsConclusion(o).armyString)
    .join('\n')

  return ctx.replyWithMarkdown(text)
}))

function generatePlayerStats(players) {
  if (!Array.isArray(players)) {
    players = [players]
  }

  const allStats = players
    .map(o => playerStatsDb.get(o))
  const buttons = allStats.map(o => createPlayerShareButton(o))

  let text = ''
  if (allStats.length > 1) {
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
