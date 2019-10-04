import {Extra, Markup, Composer} from 'telegraf'
import {Gamescreen} from 'bastion-siege-logic'
import {markdown as format} from 'telegram-format'

import {PlayerStats} from '../lib/types'

import {whenScreenContainsInformation} from '../lib/input/gamescreen'

import * as playerStatsDb from '../lib/data/playerstats-db'
import * as poweruser from '../lib/data/poweruser'
import * as userSessions from '../lib/data/user-sessions'
import * as wars from '../lib/data/wars'

import {getMidnightXDaysEarlier} from '../lib/math/unix-timestamp'

import {createPlayerShareButton, createPlayerStatsString, createPlayerStatsTwoLineString, createMultipleStatsConclusion} from '../lib/user-interface/player-stats'
import {emoji} from '../lib/user-interface/output-text'

import {notNewMiddleware} from '../lib/telegraf-middlewares'

const bot = new Composer()

bot.on('text', whenScreenContainsInformation('attackIncoming', notNewMiddleware('battle.over'), (ctx: any) => {
  const {attackIncoming} = ctx.state.screen as Gamescreen
  const {text, extra} = generatePlayerStats(attackIncoming!.name, false)
  return ctx.reply(text, extra)
}))

bot.on('text', whenScreenContainsInformation('attackscout', notNewMiddleware('battle.scoutsGone', 2), (ctx: any) => {
  const {attackscout} = ctx.state.screen as Gamescreen
  const {player, terra} = attackscout!
  const {name} = player

  const possible = playerStatsDb.getLookingLike(name, terra, true)
  if (possible.length === 0) {
    possible.push(playerStatsDb.get(name))
  }

  const {text} = generatePlayerStats(possible.map(o => o.player), false)

  const keyboard = Markup.inlineKeyboard([
    Markup.urlButton(emoji.backTo + 'Bastion Siege', 'https://t.me/BastionSiegeBot'),
    Markup.switchToChatButton(emoji.alliance + emoji.list + (ctx.i18n.t('list.shareAttack') as string), 'list')
  ] as any[])

  return ctx.reply(text, Extra.markdown().markup(keyboard))
}))

bot.on('text', whenScreenContainsInformation('allianceBattleStart', notNewMiddleware('battle.over'), async (ctx: any) => {
  const now = Date.now() / 1000
  const {allianceBattleStart, timestamp} = ctx.state.screen as Gamescreen
  const battle = allianceBattleStart!.attack ?
    {attack: [allianceBattleStart!.ally.name], defence: [allianceBattleStart!.enemy.name]} :
    {attack: [allianceBattleStart!.enemy.name], defence: [allianceBattleStart!.ally.name]}

  await wars.add(timestamp, battle)

  let text = ''
  text += ctx.i18n.t('battle.inlineWar.updated')
  text += '\n\n'

  const tag = userMarkdownTagWhenKnown(allianceBattleStart!.ally.name, now)
  if (tag) {
    text += tag
    text += '\n\n'
  }

  const {text: statsText, extra} = generatePlayerStats(allianceBattleStart!.enemy.name, false)
  text += statsText

  return ctx.reply(text, extra)
}))

bot.on('text', whenScreenContainsInformation('allianceBattleSupport', notNewMiddleware('battle.over'), (ctx: any) => {
  const {allianceBattleSupport} = ctx.state.screen as Gamescreen
  const {text, extra} = generatePlayerStats(allianceBattleSupport!.name, false)
  return ctx.reply(text, extra)
}))

bot.on('text', whenScreenContainsInformation('allianceJoinRequest', notNewMiddleware(), (ctx: any) => {
  const {allianceJoinRequest} = ctx.state.screen as Gamescreen
  const {text, extra} = generatePlayerStats(allianceJoinRequest!.name, false)
  return ctx.reply(text, extra)
}))

bot.on('text', whenScreenContainsInformation('list', notNewMiddleware('forward.old'), (ctx: any) => {
  if (!poweruser.isPoweruser(ctx.from.id)) {
    return ctx.replyWithMarkdown(ctx.i18n.t('poweruser.usefulWhen'))
  }

  const {list} = ctx.state.screen as Gamescreen
  const names = list!.map(o => o.name)

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

  const {castleSiegeParticipants} = ctx.state.screen as Gamescreen
  text += castleSiegeParticipants!
    .filter(o => o.players.length >= 5)
    .map(o => o.players.map(player => playerStatsDb.get(player)))
    .map(o => createMultipleStatsConclusion(o).armyString)
    .join('\n')

  return ctx.replyWithMarkdown(text)
}))

bot.on('text', whenScreenContainsInformation('chat', notNewMiddleware('forward.old', 60 * 4), (ctx: any) => {
  const now = Date.now() / 1000
  const {chat} = ctx.state.screen as Gamescreen
  const {text: statsText, extra} = generatePlayerStats(chat!.sender, false)

  let text = ''
  text += userMarkdownTagWhenKnown(chat!.sender, now) || format.escape(chat!.sender)
  text += ': '
  text += format.escape(chat!.text)
  text += '\n\n'

  text += statsText

  return ctx.reply(text, extra)
}))

function userMarkdownTagWhenKnown(name: string, now: number): string | undefined {
  const userId = userSessions.getUserIdByName(name)
  if (userId === undefined) {
    return
  }

  const user = userSessions.getUser(userId)
  const minTimestamp = getMidnightXDaysEarlier(now, poweruser.MAX_PLAYER_AGE_DAYS)
  const {player, playerTimestamp} = user.gameInformation
  if (!player || !playerTimestamp || playerTimestamp < minTimestamp) {
    return
  }

  let text = ''
  if (user.__username) {
    text += '@' + user.__username
  } else {
    text += format.url(player.name, `tg://user?id=${userId}`)
  }

  return text
}

function generatePlayerStats(players: string | string[], short: boolean): {text: string; extra: any} {
  if (!Array.isArray(players)) {
    players = [players]
  }

  const allStats = players
    .map(o => statsFromPlayernameWhenUnique(o))
  const buttons = allStats
    .filter(o => o.battlesObservedNearPast > 0)
    .map(o => createPlayerShareButton(o))

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

function statsFromPlayernameWhenUnique(player: string): PlayerStats {
  if (player.endsWith('~') && player.length === 14) {
    const possible = playerStatsDb.getFromShortened(player)
    if (possible.length === 1) {
      return possible[0]
    }
  }

  return playerStatsDb.get(player)
}

module.exports = {
  bot
}
