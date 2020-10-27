import {Extra, Markup, Composer} from 'telegraf'
import {ExtraReplyMessage} from 'telegraf/typings/telegram-types'
import {markdown as format} from 'telegram-format'
import {SwitchToChatButton} from 'telegraf/typings/markup'

import {ContextAwareDebounce} from '../lib/javascript-abstraction/context-aware-debounce'

import {PlayerStats, Context} from '../lib/types'

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

export const bot = new Composer<Context>()

bot.on('text', whenScreenContainsInformation('attackIncoming', notNewMiddleware('battle.over'), async ctx => {
  const {timeZone} = ctx.session
  const {attackIncoming} = ctx.state.screen
  const {text, extra} = generatePlayerStats(attackIncoming!.name, false, timeZone)
  await ctx.reply(text, extra)
}))

const DEBOUNCE_TIME = 200 // Milliseconds
const debouncedAttackscout = new ContextAwareDebounce<number, (ctx: Context) => Promise<void>>(attackscoutResponse, DEBOUNCE_TIME)
bot.on('text', whenScreenContainsInformation('attackscout', notNewMiddleware('battle.scoutsGone', 2), ctx => {
  debouncedAttackscout.callFloating(ctx.from.id, ctx)
}))

async function attackscoutResponse(ctx: Context): Promise<void> {
  const {timeZone} = ctx.session
  const {player, terra} = attackscouts.getLastAttackscoutOfUser(ctx.from!.id)!
  const {name} = player

  const possible = playerStatsDb.getLookingLike(name, terra, true)
  if (possible.length === 0) {
    possible.push(playerStatsDb.get(name))
  }

  const {text} = generatePlayerStats(possible.map(o => o.player), false, timeZone)

  const keyboard = Markup.inlineKeyboard([
    Markup.urlButton(emoji.backTo + 'Bastion Siege', 'https://t.me/BastionSiegeBot'),
    Markup.switchToChatButton(emoji.alliance + emoji.list + (ctx.i18n.t('list.shareAttack')), 'list')
  ])

  await ctx.reply(text, Extra.markdown().markup(keyboard))
}

bot.on('text', whenScreenContainsInformation('allianceBattleStart', notNewMiddleware('battle.over'), async ctx => {
  const now = Date.now() / 1000
  const {timeZone} = ctx.session
  const {allianceBattleStart, timestamp} = ctx.state.screen
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

bot.on('text', whenScreenContainsInformation('allianceBattleSupport', notNewMiddleware('battle.over'), async ctx => {
  const {timeZone} = ctx.session
  const {allianceBattleSupport} = ctx.state.screen
  const {text, extra} = generatePlayerStats(allianceBattleSupport!.name, false, timeZone)
  await ctx.reply(text, extra)
}))

bot.on('text', whenScreenContainsInformation([
  'allianceJoinRequest',
  'alreadyInFight',
  'conqueror',
  'notRecoveredFromFight'
], notNewMiddleware(), async ctx => {
  const {timeZone} = ctx.session
  const {allianceJoinRequest, alreadyInFight, conqueror, notRecoveredFromFight} = ctx.state.screen
  const player = allianceJoinRequest || alreadyInFight || conqueror || notRecoveredFromFight!
  const {text, extra} = generatePlayerStats(player.name, false, timeZone)
  await ctx.reply(text, extra)
}))

bot.on('text', whenScreenContainsInformation('list', notNewMiddleware('forward.old'), async ctx => {
  if (!poweruser.isPoweruser(ctx.from.id)) {
    await ctx.replyWithMarkdown(ctx.i18n.t('poweruser.usefulWhen'))
    return
  }

  const {timeZone} = ctx.session
  const {list, type} = ctx.state.screen
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
    appendix += createSimpleDataString(armySAA, emoji.barracks, ['avg', 'sum'], true) + '\n'
  }

  await ctx.reply(text + appendix, extra)
}))

bot.on('text', whenScreenContainsInformation('castleSiegeParticipants', notNewMiddleware('forward.old', 60 * 12), async ctx => {
  let text = `*${ctx.i18n.t('bs.siege')}*\n`
  if (!poweruser.isPoweruser(ctx.from.id)) {
    text += ctx.i18n.t('poweruser.usefulWhen')
    await ctx.replyWithMarkdown(text)
    return
  }

  const {castleSiegeParticipants} = ctx.state.screen
  text += castleSiegeParticipants!
    .filter(o => o.players.length >= 5)
    .map(o => o.players.map(player => playerStatsDb.get(player)))
    .map(o => createMultipleStatsConclusion(o).armyString)
    .join('\n')

  await ctx.replyWithMarkdown(text)
}))

bot.on('text', whenScreenContainsInformation('chat', notNewMiddleware('forward.old', 60 * 4), async ctx => {
  const now = Date.now() / 1000
  const {timeZone} = ctx.session
  const {chat} = ctx.state.screen
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

function generatePlayerStats(players: string | string[], short: boolean, timeZone: string | undefined): {text: string; extra: ExtraReplyMessage} {
  const {allStats, buttons} = generatePlayerStatsRaw(players)

  let text = ''
  // eslint-disable-next-line unicorn/prefer-ternary
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
    text += createSimpleDataString(armySAA, emoji.army, ['avg', 'sum'], true) + '\n'
  }

  return {
    text,
    extra: Extra.markdown().markup(Markup.inlineKeyboard(buttons, {columns: 2}))
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
