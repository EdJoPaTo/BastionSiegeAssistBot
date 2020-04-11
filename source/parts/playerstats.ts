import {Extra, Markup, Composer, SwitchToChatButton} from 'telegraf'
import {Gamescreen} from 'bastion-siege-logic'
import {markdown as format} from 'telegram-format'
import debounce from 'debounce-promise'

import {PlayerStats, Session} from '../lib/types'

import {whenScreenContainsInformation} from '../lib/input/gamescreen'

import * as attackscouts from '../lib/data/ingame/attackscouts'
import * as playerStatsDb from '../lib/data/playerstats-db'
import * as poweruser from '../lib/data/poweruser'
import * as userSessions from '../lib/data/user-sessions'
import * as wars from '../lib/data/wars'

import {getMidnightXDaysEarlier} from '../lib/math/unix-timestamp'
import {getSumAverageAmount} from '../lib/math/number-array'

import {createPlayerShareButton, createPlayerStatsString, createMultipleStatsConclusion, createPlayerStatsSingleLineString} from '../lib/user-interface/player-stats'
import {createSimpleDataString} from '../lib/user-interface/number-array-strings'
import {emoji} from '../lib/user-interface/output-text'

import {notNewMiddleware} from '../lib/telegraf-middlewares'

export const bot = new Composer()

bot.on('text', whenScreenContainsInformation('attackIncoming', notNewMiddleware('battle.over'), async (ctx: any) => {
  const {timeZone} = ctx.session as Session
  const {attackIncoming} = ctx.state.screen as Gamescreen
  const {text, extra} = generatePlayerStats(attackIncoming!.name, false, timeZone)
  await ctx.reply(text, extra)
}))

const DEBOUNCE_TIME = 200 // Milliseconds
const debouncedAttackscout: Record<number, (ctx: any) => Promise<void>> = {}

bot.on('text', whenScreenContainsInformation('attackscout', notNewMiddleware('battle.scoutsGone', 2), (ctx: any) => {
  console.time('wat')
  const {id} = ctx.from
  if (!debouncedAttackscout[id]) {
    debouncedAttackscout[id] = debounce(attackscoutResponse, DEBOUNCE_TIME)
  }

  debouncedAttackscout[id](ctx)
  console.timeEnd('wat')
}))

async function attackscoutResponse(ctx: any): Promise<void> {
  const {timeZone} = ctx.session as Session
  const {player, terra} = attackscouts.getLastAttackscoutOfUser(ctx.from.id)!
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

  await ctx.reply(text, Extra.markdown().markup(keyboard))
}

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

  await ctx.reply(text, extra)
}))

bot.on('text', whenScreenContainsInformation('allianceBattleSupport', notNewMiddleware('battle.over'), async (ctx: any) => {
  const {timeZone} = ctx.session as Session
  const {allianceBattleSupport} = ctx.state.screen as Gamescreen
  const {text, extra} = generatePlayerStats(allianceBattleSupport!.name, false, timeZone)
  await ctx.reply(text, extra)
}))

bot.on('text', whenScreenContainsInformation([
  'allianceJoinRequest',
  'alreadyInFight',
  'conqueror',
  'notRecoveredFromFight'
], notNewMiddleware(), async (ctx: any) => {
  const {timeZone} = ctx.session as Session
  const {allianceJoinRequest, alreadyInFight, conqueror, notRecoveredFromFight} = ctx.state.screen as Gamescreen
  const player = allianceJoinRequest || alreadyInFight || conqueror || notRecoveredFromFight!
  const {text, extra} = generatePlayerStats(player.name, false, timeZone)
  await ctx.reply(text, extra)
}))

bot.on('text', whenScreenContainsInformation('list', notNewMiddleware('forward.old'), async (ctx: any) => {
  if (!poweruser.isPoweruser(ctx.from.id)) {
    await ctx.replyWithMarkdown(ctx.i18n.t('poweruser.usefulWhen'))
    return
  }

  const {timeZone} = ctx.session as Session
  const {list, type} = ctx.state.screen as Gamescreen
  const names = list!.map(o => o.name)

  if (names.length === 0) {
    await ctx.reply('not players…')
    return
  }

  const {text, extra} = generatePlayerStats(names, true, timeZone)
  let appendix = ''

  if (type === 'allianceMembers') {
    const armySAA = getSumAverageAmount(list!.map(o => Number(o.value)))
    appendix += armySAA.amount
    appendix += ': '
    appendix += createSimpleDataString(armySAA, emoji.barracks, ['avg', 'stdDeviation', 'sum'], true) + '\n'
  }

  await ctx.reply(text + appendix, extra)
}))

bot.on('text', whenScreenContainsInformation('castleSiegeParticipants', notNewMiddleware('forward.old', 60 * 12), async (ctx: any) => {
  let text = `*${ctx.i18n.t('bs.siege')}*\n`
  if (!poweruser.isPoweruser(ctx.from.id)) {
    text += ctx.i18n.t('poweruser.usefulWhen')
    await ctx.replyWithMarkdown(text)
    return
  }

  const {castleSiegeParticipants} = ctx.state.screen as Gamescreen
  text += castleSiegeParticipants!
    .filter(o => o.players.length >= 5)
    .map(o => o.players.map(player => playerStatsDb.get(player)))
    .map(o => createMultipleStatsConclusion(o).armyString)
    .join('\n')

  await ctx.replyWithMarkdown(text)
}))

bot.on('text', whenScreenContainsInformation('chat', notNewMiddleware('forward.old', 60 * 4), async (ctx: any) => {
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

  await ctx.reply(text, extra)
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
  text += format.url(format.escape(player.name), `tg://user?id=${userId}`)

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
    text += allStats.map(o => createPlayerStatsSingleLineString(o, undefined, undefined)).join('\n')
  } else {
    text += allStats.map(o => createPlayerStatsString(o, timeZone || 'UTC')).join('\n\n')
  }

  if (allStats.length > 4) {
    text += '\n\n'

    const armySAA = getSumAverageAmount(allStats.map(o => o.army))
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
