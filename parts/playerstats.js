const Telegraf = require('telegraf')

const playerStatsDb = require('../lib/data/playerstats-db')
const poweruser = require('../lib/data/poweruser')
const wars = require('../lib/data/wars')

const {createPlayerShareButton, createPlayerStatsString, createPlayerStatsTwoLineString, createMultipleStatsConclusion} = require('../lib/user-interface/player-stats')

const {Extra, Markup} = Telegraf

const bot = new Telegraf.Composer()

function screenContainsInformation(name) {
  return ctx => ctx.state.screen &&
    ctx.state.screen.information &&
    ctx.state.screen.information[name]
}

function notNewMiddleware(i18nMessage = 'forward.old', maxAgeInMinutes = 8) {
  return (ctx, next) => {
    const time = ctx.message.forward_date
    const minutesAgo = ((Date.now() / 1000) - time) / 60
    if (minutesAgo > maxAgeInMinutes) {
      return ctx.reply(ctx.i18n.t(i18nMessage))
    }

    return next()
  }
}

bot.on('text', Telegraf.optional(screenContainsInformation('attackincoming'), notNewMiddleware('battle.over'), ctx => {
  const {attackincoming} = ctx.state.screen.information
  const {text, extra} = generatePlayerStats(attackincoming.player)
  return ctx.reply(text, extra)
}))

bot.on('text', Telegraf.optional(screenContainsInformation('attackscout'), notNewMiddleware('battle.scoutsGone', 2), ctx => {
  const {attackscout} = ctx.state.screen.information
  const {text, extra} = generatePlayerStats(attackscout.player)
  return ctx.reply(text, extra)
}))

bot.on('text', Telegraf.optional(screenContainsInformation('allianceBattleStart'), notNewMiddleware('battle.over'), async ctx => {
  const {allianceBattleStart} = ctx.state.screen.information
  const battle = allianceBattleStart.attack ?
    {attack: [allianceBattleStart.ally], defence: [allianceBattleStart.enemy]} :
    {attack: [allianceBattleStart.enemy], defence: [allianceBattleStart.ally]}

  const time = ctx.message.forward_date
  await wars.add(time, battle)

  let text = ''
  text += ctx.i18n.t('battle.inlineWar.updated')
  text += '\n\n'

  const {text: statsText, extra} = generatePlayerStats(allianceBattleStart.enemy)
  text += statsText

  return ctx.reply(text, extra)
}))

bot.on('text', Telegraf.optional(screenContainsInformation('allianceBattleSupport'), notNewMiddleware('battle.over'), ctx => {
  const {allianceBattleSupport} = ctx.state.screen.information
  const {text, extra} = generatePlayerStats(allianceBattleSupport.player)
  return ctx.reply(text, extra)
}))

bot.on('text', Telegraf.optional(screenContainsInformation('alliancejoinrequest'), notNewMiddleware(), ctx => {
  const {alliancejoinrequest} = ctx.state.screen.information
  const {text, extra} = generatePlayerStats(alliancejoinrequest.player)
  return ctx.reply(text, extra)
}))

bot.on('text', Telegraf.optional(screenContainsInformation('castleSiegeParticipants'), notNewMiddleware('forward.old', 60), ctx => {
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
