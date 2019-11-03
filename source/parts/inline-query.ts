import {inputTextCleanup, MYSTICS_TEXT_EN} from 'bastion-siege-logic'
import fuzzysort from 'fuzzysort'
import {Composer, Extra, Markup} from 'telegraf'

import {replaceLookingLikeAsciiChars} from '../lib/javascript-abstraction/strings'

import {Context} from '../lib/types'

import * as playerStatsDb from '../lib/data/playerstats-db'
import * as poweruser from '../lib/data/poweruser'
import * as wars from '../lib/data/wars'

import {getMidnightXDaysEarlier} from '../lib/math/unix-timestamp'

import {createPlayerNameString, createPlayerStatsString, createPlayerStatsShortString} from '../lib/user-interface/player-stats'
import {createWarOneLineString, createWarStats} from '../lib/user-interface/war-stats'
import {emoji} from '../lib/user-interface/output-text'
import {createList} from '../lib/user-interface/inline-list'

interface AnswerInlineQueryOptions {
  cache_time?: number;
  is_personal?: boolean;
  next_offset?: string;
  switch_pm_text?: string;
  switch_pm_parameter?: string;
}

export const bot = new Composer<Context>()

bot.on('inline_query', async ctx => {
  const {session} = ctx
  const {query} = ctx.inlineQuery!
  const cleanedUpQuery = replaceLookingLikeAsciiChars(inputTextCleanup(query))
  const queryTestFunc = getTestFunctionForQuery(cleanedUpQuery)
  const offset = Number(ctx.inlineQuery!.offset) || 0
  const now = Date.now() / 1000
  const isPoweruser = poweruser.isPoweruser(ctx.from!.id)

  const statics = []
  const user = session.gameInformation.player!
  if (isPoweruser) {
    const {timestamp, battle} = wars.getCurrent(now, user.name) || {}
    if (timestamp && battle) {
      let message_text = ''
      message_text += createWarStats(now, battle, user)
      message_text += '\n\n'
      message_text += ctx.i18n.t('battle.inlineWar.info')

      statics.push({
        type: 'article',
        id: 'war',
        title: emoji.poweruser + ' ' + ctx.i18n.t('bs.war'),
        description: createWarOneLineString(battle),
        input_message_content: {
          message_text,
          parse_mode: 'markdown'
        },
        reply_markup: Markup.inlineKeyboard([
          Markup.callbackButton(ctx.i18n.t('battle.inlineWar.updateButton'), `inlineWar:${user.alliance}:${user.name}`)
        ])
      })
    }
  }

  const {text, keyboard} = createList(ctx.from!.id, 'default', now)
  statics.push({
    type: 'article',
    id: 'list-default',
    title: emoji.list + ' ' + ctx.i18n.t('list.title'),
    description: ctx.i18n.t('list.description'),
    input_message_content: {
      message_text: text,
      parse_mode: 'markdown'
    },
    reply_markup: keyboard
  })

  const filteredStatics = statics
    .filter(o => queryTestFunc(JSON.stringify(o)))

  let players: string[] = []
  const options: AnswerInlineQueryOptions = {
    is_personal: true,
    cache_time: 20
  }

  if (!isPoweruser) {
    options.switch_pm_text = ctx.i18n.t('poweruser.usefulWhen') + ' ' + emoji.poweruser
    options.switch_pm_parameter = 'be-a-poweruser'
  }

  if (isPoweruser && query && query.length >= 1) {
    const allPlayers = playerStatsDb.list()
    const result = await fuzzysort.goAsync(cleanedUpQuery, allPlayers, {
      key: 'playerNameLookingLike'
    })
    players = result.map(o => o.obj.player)
  } else {
    // TODO: Currently only the english ones are in default search, mystics should be grouped by mystic, not by name
    const freeOptions = [...Object.values(MYSTICS_TEXT_EN)]

    if (user && session.gameInformation.playerTimestamp! > getMidnightXDaysEarlier(now, poweruser.MAX_PLAYER_AGE_DAYS)) {
      freeOptions.push(user.name)
    }

    players = freeOptions
      .filter(o => queryTestFunc(o))
  }

  const playerResults = players
    .map(o => playerStatsDb.get(o))
    .slice(offset, offset + 20)
    .map(stats => {
      return {
        type: 'article',
        id: `player-${stats.player}`,
        title: createPlayerNameString(stats, false),
        description: createPlayerStatsShortString(stats),
        input_message_content: {
          message_text: createPlayerStatsString(stats),
          parse_mode: 'markdown'
        }
      }
    })

  if (players.length > offset + 20) {
    options.next_offset = String(offset + 20)
  }

  if (process.env.NODE_ENV !== 'production') {
    options.cache_time = 2
  }

  return ctx.answerInlineQuery([
    ...filteredStatics,
    ...playerResults
  ], options)
})

function getTestFunctionForQuery(query: string): (o: string) => boolean {
  try {
    const regex = new RegExp(query, 'i')
    return o => regex.test(o)
  } catch (_) {
    return o => o.includes(query)
  }
}

bot.action(/inlineWar:(.*):(.+)/, async ctx => {
  const now = Date.now() / 1000
  const player = {
    alliance: ctx.match![1],
    name: ctx.match![2]
  }
  const {timestamp, battle} = wars.getCurrent(now, player.name) || {}
  if (!timestamp) {
    return ctx.editMessageText('This war seems over…')
  }

  wars.addInlineMessageToUpdate(now, player, ctx.callbackQuery!.inline_message_id!)
  const warText = createWarStats(timestamp, battle, player)
  return ctx.editMessageText(warText, Extra.markdown() as any)
})

module.exports = {
  bot
}
