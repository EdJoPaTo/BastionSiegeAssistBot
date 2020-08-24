import {Composer, Extra, Markup} from 'telegraf'
import {InlineQueryResult} from 'telegraf/typings/telegram-types'
import {inputTextCleanup, MYSTICS_TEXT_EN, Castle, castleGametext} from 'bastion-siege-logic'
import arrayFilterUnique from 'array-filter-unique'
import fuzzysort from 'fuzzysort'

import {replaceLookingLikeAsciiChars} from '../lib/javascript-abstraction/strings'

import {Context} from '../lib/types'

import * as castleSiege from '../lib/data/castle-siege'
import * as playerStatsDb from '../lib/data/playerstats-db'
import * as poweruser from '../lib/data/poweruser'
import * as wars from '../lib/data/wars'

import {getMidnightXDaysEarlier} from '../lib/math/unix-timestamp'

import {castlePart} from '../lib/user-interface/castle-siege'
import {createList} from '../lib/user-interface/inline-list'
import {createPlayerNameString, createPlayerStatsString, createPlayerStatsShortString} from '../lib/user-interface/player-stats'
import {createWarOneLineString, createWarStats} from '../lib/user-interface/war-stats'
import {emoji} from '../lib/user-interface/output-text'

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

  const statics: InlineQueryResult[] = []
  const user = session.gameInformation.player
  if (isPoweruser && user?.alliance) {
    const war = wars.getCurrent(now, user.name)
    if (war) {
      let message_text = ''
      message_text += createWarStats(now, war.battle, user)
      message_text += '\n\n'
      message_text += ctx.i18n.t('battle.inlineWar.info')

      statics.push({
        type: 'article',
        id: 'war',
        title: emoji.war + emoji.poweruser + ' War',
        description: createWarOneLineString(war.battle),
        input_message_content: {
          message_text,
          parse_mode: 'markdown'
        },
        reply_markup: Markup.inlineKeyboard([
          Markup.callbackButton(ctx.i18n.t('battle.inlineWar.updateButton'), `inlineWar:${user.alliance}:${user.name}`)
        ])
      })
    }

    const alliance = session.gameInformation.player?.alliance
    if (alliance) {
      const relevantCastles = castleSiege.getCastlesAllianceIsParticipatingInRecently(alliance, now)
      statics.push(...relevantCastles
        .map((castle): InlineQueryResult => {
          const text = castlePart(castle, {
            now,
            userAlliance: alliance,
            userIsPoweruser: isPoweruser
          })

          return {
            type: 'article',
            id: `castle-${castle}`,
            title: emoji.castle + emoji.poweruser + ' Siege',
            description: castleGametext(castle, 'en'),
            input_message_content: {
              message_text: text,
              parse_mode: 'markdown'
            },
            reply_markup: Markup.inlineKeyboard([
              Markup.callbackButton(ctx.i18n.t('battle.inlineWar.updateButton'), `inlineCastleSiege:${castle}:${alliance}`)
            ])
          }
        })
      )
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
    players = result
      .map(o => o.obj.player)
      .filter(arrayFilterUnique())
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
          message_text: createPlayerStatsString(stats, session.timeZone || 'UTC'),
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
  } catch {
    return o => o.includes(query)
  }
}

bot.action(/inlineWar:(.*):(.+)/, async ctx => {
  const now = Date.now() / 1000
  const player = {
    alliance: ctx.match![1],
    name: ctx.match![2]
  }
  const currentWar = wars.getCurrent(now, player.name)
  if (!currentWar) {
    return ctx.editMessageText('This war seems over…')
  }

  await wars.addInlineMessageToUpdate(now, player, ctx.callbackQuery!.inline_message_id!)
  const {timestamp, battle} = currentWar
  const warText = createWarStats(timestamp, battle, player)
  return ctx.editMessageText(warText, Extra.markdown() as any)
})

bot.action(/^inlineCastleSiege:(.+):(.+)$/, async ctx => {
  const now = Date.now() / 1000
  const castle = ctx.match![1] as Castle
  const alliance = ctx.match![2]
  await castleSiege.addInlineMessage(ctx.callbackQuery!.inline_message_id!, castle, alliance, now)
})
