import {Extra, Markup, Composer, SwitchToChatButton} from 'telegraf'
import {Gamescreen} from 'bastion-siege-logic'
import {markdown as format} from 'telegram-format'

import {PlayerStats, Session} from '../lib/types'

import {whenScreenContainsInformation} from '../lib/input/gamescreen'

import * as playerStatsDb from '../lib/data/playerstats-db'
import * as poweruser from '../lib/data/poweruser'
import * as userSessions from '../lib/data/user-sessions'
import * as wars from '../lib/data/wars'

import {getMidnightXDaysEarlier} from '../lib/math/unix-timestamp'
import {getSumAverageAmount} from '../lib/math/number-array'

import {createPlayerShareButton, createPlayerStatsString, createPlayerStatsTwoLineString, createMultipleStatsConclusion} from '../lib/user-interface/player-stats'
import {createSimpleDataString} from '../lib/user-interface/number-array-strings'
import {emoji} from '../lib/user-interface/output-text'

import {notNewMiddleware} from '../lib/telegraf-middlewares'

export const bot = new Composer()

bot.on('text', whenScreenContainsInformation('attackIncoming', notNewMiddleware('battle.over'), (ctx: any) => {
  const {timeZone} = ctx.session as Session
  const {attackIncoming} = ctx.state.screen as Gamescreen
  const {text, extra} = generatePlayerStats(attackIncoming!.name, false, timeZone)
  return ctx.reply(text, extra)
}))

bot.on('text', whenScreenContainsInformation('attackscout', notNewMiddleware('battle.scoutsGone', 2), (ctx: any) => {
  const {timeZone} = ctx.session as Session
  const {attackscout} = ctx.state.screen as Gamescreen
  const {player, terra} = attackscout!
  const {name} = player

  const possible = playerStatsDb.getLookingLike(name, terra, true)
  if (possible.length === 0) {
    possible.push(playerStatsDb.get(name))
  }

  const {text} = generatePlayerStats(possible.map(o => o.player), false, timeZone)

  const keyboard = Markup.inlineKeyboard([
    Markup.urlButton(emoji.backTo + 'Bastion Siege', 'https://t.me/BastionSiegeBot'),
    Markup.switchToChatButton(emoji.alliance + emoji.list + (ctx.i18n.t('list.shareAttack') as string), 'list')
  ] as any[])

  return ctx.reply(text, Extra.markdown().markup(keyboard))
}))

bot.on('text', whenScreenContainsInformation('allianceBattleStart', notNewMiddleware('battle.over'), async (ctx: any) => {
  const now = Date.now() / 1000
  const {timeZone} = ctx.session as Session
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

  const {text: statsText, extra} = generatePlayerStats(allianceBattleStart!.enemy.name, false, timeZone)
  text += statsText

  return ctx.reply(text, extra)
}))

bot.on('text', whenScreenContainsInformation('allianceBattleSupport', notNewMiddleware('battle.over'), (ctx: any) => {
  const {timeZone} = ctx.session as Session
  const {allianceBattleSupport} = ctx.state.screen as Gamescreen
  const {text, extra} = generatePlayerStats(allianceBattleSupport!.name, false, timeZone)
  return ctx.reply(text, extra)
}))

bot.on('text', whenScreenContainsInformation('allianceJoinRequest', notNewMiddleware(), (ctx: any) => {
  const {timeZone} = ctx.session as Session
  const {allianceJoinRequest} = ctx.state.screen as Gamescreen
  const {text, extra} = generatePlayerStats(allianceJoinRequest!.name, false, timeZone)
  return ctx.reply(text, extra)
}))

bot.on('text', whenScreenContainsInformation('list', notNewMiddleware('forward.old'), (ctx: any) => {
  if (!poweruser.isPoweruser(ctx.from.id)) {
    return ctx.replyWithMarkdown(ctx.i18n.t('poweruser.usefulWhen'))
  }

  const {timeZone} = ctx.session as Session
  const {list} = ctx.state.screen as Gamescreen
  const names = list!.map(o => o.name)

  if (names.length === 0) {
    return ctx.reply('not players…')
  }

  const {text, extra} = generatePlayerStats(names, true, timeZone)
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
  const {timeZone} = ctx.session as Session
  const {chat} = ctx.state.screen as Gamescreen
  const {text: statsText, extra} = generatePlayerStats(chat!.sender, false, timeZone)

  let text = ''
  text += userMarkdownTagWhenKnown(chat!.sender, now) || format.escape(chat!.sender)
  text += ': '
  text += format.escape(chat!.text)
  text += '\n\n'

  text += statsText

  return ctx.reply(text, extra)
}))

bot.on('text', whenScreenContainsInformation('conqueror', notNewMiddleware('forward.old'), (ctx: any) => {
  const {timeZone} = ctx.session as Session
  const {conqueror} = ctx.state.screen as Gamescreen
  const {text, extra} = generatePlayerStats(conqueror!.name, false, timeZone)
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
  text += format.url(player.name, `tg://user?id=${userId}`)

  return text
}

function generatePlayerStatsRaw(players: string | string[]): {allStats: PlayerStats[]; buttons: SwitchToChatButton[]} {
  if (!Array.isArray(players)) {
    players = [players]
  }

  const allStats = players
    .map(o => statsFromPlayernameWhenUnique(o))
  const buttons = allStats
    .filter(o => o.battlesObservedNearPast > 0)
    .map(o => createPlayerShareButton(o))

  return {allStats, buttons}
}

function generatePlayerStats(players: string | string[], short: boolean, timeZone: string | undefined): {text: string; extra: any} {
  const {allStats, buttons} = generatePlayerStatsRaw(players)

  let text = ''
  if (short) {
    text += allStats.map(o => createPlayerStatsTwoLineString(o, true)).join('\n')
  } else {
    text += allStats.map(o => createPlayerStatsString(o, timeZone || 'UTC')).join('\n\n')
  }

  if (allStats.length > 4) {
    text += '\n\n'

    const armySAA = getSumAverageAmount(allStats.map(o => o.army.min))
    text += armySAA.amount
    text += ': '
    text += createSimpleDataString(armySAA, emoji.army, ['avg', 'stdDeviation'], true) + '\n'
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
