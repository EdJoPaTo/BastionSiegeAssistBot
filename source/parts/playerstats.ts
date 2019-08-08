import {CastleSiegeParticipant, ListEntry} from 'bastion-siege-logic'
import {Extra, Markup, Composer} from 'telegraf'

import {whenScreenContainsInformation} from '../lib/input/gamescreen'

import * as playerStatsDb from '../lib/data/playerstats-db'
import * as poweruser from '../lib/data/poweruser'
import * as wars from '../lib/data/wars'

import {createPlayerShareButton, createPlayerStatsString, createPlayerStatsTwoLineString, createMultipleStatsConclusion} from '../lib/user-interface/player-stats'

import {notNewMiddleware} from '../lib/telegraf-middlewares'

const bot = new Composer()

bot.on('text', whenScreenContainsInformation('attackIncoming', notNewMiddleware('battle.over'), (ctx: any) => {
  const {attackIncoming} = ctx.state.screen
  const {text, extra} = generatePlayerStats(attackIncoming.name)
  return ctx.reply(text, extra)
}))

bot.on('text', whenScreenContainsInformation('attackscout', notNewMiddleware('battle.scoutsGone', 2), (ctx: any) => {
  const {attackscout} = ctx.state.screen
  const {player, terra} = attackscout
  const {name} = player

  const possible = playerStatsDb.getLookingLike(name, terra, true)
  if (possible.length === 0) {
    possible.push(playerStatsDb.get(name))
  }

  const {text} = generatePlayerStats(possible.map(o => o.player))

  const keyboard = Markup.inlineKeyboard([
    Markup.switchToChatButton(ctx.i18n.t('list.shareAttack'), 'list')
  ] as any[])

  return ctx.reply(text, Extra.markdown().markup(keyboard))
}))

bot.on('text', whenScreenContainsInformation('allianceBattleStart', notNewMiddleware('battle.over'), async (ctx: any) => {
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

bot.on('text', whenScreenContainsInformation('allianceBattleSupport', notNewMiddleware('battle.over'), (ctx: any) => {
  const {allianceBattleSupport} = ctx.state.screen
  const {text, extra} = generatePlayerStats(allianceBattleSupport.name)
  return ctx.reply(text, extra)
}))

bot.on('text', whenScreenContainsInformation('allianceJoinRequest', notNewMiddleware(), (ctx: any) => {
  const {allianceJoinRequest} = ctx.state.screen
  const {text, extra} = generatePlayerStats(allianceJoinRequest.name)
  return ctx.reply(text, extra)
}))

bot.on('text', whenScreenContainsInformation('list', notNewMiddleware('forward.old'), (ctx: any) => {
  if (!poweruser.isPoweruser(ctx.from.id)) {
    return ctx.replyWithMarkdown(ctx.i18n.t('poweruser.usefulWhen'))
  }

  const list = ctx.state.screen.list as ListEntry[]
  const names = list.map(o => o.name)

  if (names.length === 0) {
    return ctx.reply('not players…')
  }

  const {text, extra} = generatePlayerStats(names, true)
  return ctx.reply(text, extra)
}))

bot.on('text', whenScreenContainsInformation('castleSiegeParticipants', notNewMiddleware('forward.old', 60 * 12), (ctx: any) => {
  let text = `*${ctx.i18n.t('bs.siege')}*\n`
  if (!poweruser.isPoweruser(ctx.from.id)) {
    text += ctx.i18n.t('poweruser.usefulWhen')
    return ctx.replyWithMarkdown(text)
  }

  const castleSiegeParticipants = ctx.state.screen.castleSiegeParticipants as CastleSiegeParticipant[]
  text += castleSiegeParticipants
    .filter(o => o.players.length >= 5)
    .map(o => o.players.map(player => playerStatsDb.get(player)))
    .map(o => createMultipleStatsConclusion(o).armyString)
    .join('\n')

  return ctx.replyWithMarkdown(text)
}))

function generatePlayerStats(players: string | string[], short = false): {text: string; extra: any} {
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
    extra: Extra.markdown().markup(Markup.inlineKeyboard(buttons as any, {columns: 2}))
  }
}

module.exports = {
  bot
}
