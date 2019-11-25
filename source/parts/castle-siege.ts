import {Composer, ContextMessageUpdate} from 'telegraf'
import {Gamescreen, CASTLES, castleGametext, Castle} from 'bastion-siege-logic'
import debounce from 'debounce-promise'

import {whenScreenContainsInformation, whenScreenIsOfType} from '../lib/input/gamescreen'

import {ONE_DAY_IN_SECONDS} from '../lib/math/unix-timestamp'

import {Session} from '../lib/types'

import * as castles from '../lib/data/castles'
import * as castleSiege from '../lib/data/castle-siege'
import * as userSessions from '../lib/data/user-sessions'
import * as poweruser from '../lib/data/poweruser'

import {notNewMiddleware} from '../lib/telegraf-middlewares'

import {createPlayerMarkdownLink, createPlayerNameString} from '../lib/user-interface/player-stats'
import {emoji} from '../lib/user-interface/output-text'

const DEBOUNCE_TIME = 200 // Milliseconds

const MAXIMUM_PLAYER_AGE = ONE_DAY_IN_SECONDS * poweruser.MAX_PLAYER_AGE_DAYS

function getMissingMates(alliance: string, participants: string[], timestamp: number): Array<{user: number; player: string}> {
  const missingMates = userSessions.getRaw()
    .filter(o => o.data.gameInformation.playerTimestamp && o.data.gameInformation.playerTimestamp + MAXIMUM_PLAYER_AGE > timestamp)
    .filter(o => o.data.gameInformation.player!.alliance === alliance)
    .filter(o => !participants.includes(o.data.gameInformation.player!.name))
    .map(({user, data}) => ({user, player: data.gameInformation.player!.name}))

  return missingMates
}

function castleFormattedTimestampBegin(castle: Castle, locale: string | undefined, timeZone: string | undefined): string {
  return new Date(castles.nextSiegeAvailable(castle) * 1000).toLocaleString(locale, {
    timeZone,
    hour12: false,
    year: undefined,
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  })
}

function castleFormattedTimestampEnd(castle: Castle, locale: string | undefined, timeZone: string | undefined): string {
  return new Date(castles.nextSiegeBeginsFight(castle) * 1000).toLocaleTimeString(locale, {
    timeZone,
    hour12: false,
    hour: 'numeric',
    minute: '2-digit'
  })
}

export const bot = new Composer()

bot.command('castle', async ctx => {
  const now = Date.now() / 1000
  const {__language_code: lang, timeZone, gameInformation} = (ctx as any).session as Session
  const userIsPoweruser = poweruser.isPoweruser(ctx.from!.id)

  let text = ''
  text += `*${(ctx as any).i18n.t('bs.siege')}*\n`
  text += '\n'

  if (!userIsPoweruser) {
    text += emoji.poweruser
    text += ' '
    text += (ctx as any).i18n.t('poweruser.usefulWhen')
    text += '\n\n'
  }

  const {alliance} = gameInformation.player || {}

  const castleParts = CASTLES
    .map(o => {
      let part = ''
      part += '*'
      part += castleGametext(o, lang === 'ru' ? 'ru' : 'en')
      part += '*'
      part += '\n'
      part += castleFormattedTimestampBegin(o, lang, timeZone)
      part += ' - '
      part += castleFormattedTimestampEnd(o, lang, timeZone)

      if (castles.isCurrentlySiegeAvailable(o, now) && userIsPoweruser && alliance) {
        const participants = castleSiege.getParticipants(now, alliance)
        const missing = getMissingMates(alliance, participants.map(o => o.player), now)

        if (missing.length > 0) {
          part += '\n'
          part += alliance + ' '
          part += `Missing (${missing.length}): `
          part += missing
            .sort((a, b) => a.player.localeCompare(b.player))
            .map(o => createPlayerMarkdownLink(o.user, o))
            .join(', ')
        }

        part += '\n'
        part += alliance + ' '
        part += `Participants (${participants.length}): `
        part += participants
          .map(o => createPlayerNameString({player: o.player}, true))
          .join(', ')
      }

      return part
    })

  text += castleParts.join('\n\n')

  return ctx.replyWithMarkdown(text)
})

const debouncedParticipants: Record<number, (ctx: ContextMessageUpdate, timestamp: number, alliance: string) => Promise<void>> = {}
bot.on('text', whenScreenContainsInformation('castleSiegePlayerJoined', notNewMiddleware('forward.old', castleSiege.MAXIMUM_JOIN_SECONDS / 60), async ctx => {
  const {castleSiegePlayerJoined, timestamp} = (ctx as any).state.screen as Gamescreen
  const {alliance, name} = castleSiegePlayerJoined!
  await castleSiege.add(timestamp, alliance!, name)

  const {id} = ctx.from!
  if (!debouncedParticipants[id]) {
    debouncedParticipants[id] = debounce(replyCastleParticipants, DEBOUNCE_TIME)
  }

  debouncedParticipants[id](ctx, timestamp, alliance!)
}))

async function replyCastleParticipants(ctx: ContextMessageUpdate, timestamp: number, alliance: string): Promise<void> {
  const participants = castleSiege.getParticipants(timestamp, alliance)
    .map(o => o.player)

  const missingMates = getMissingMates(alliance, participants, timestamp)

  let text = ''
  text += `*${(ctx as any).i18n.t('bs.siege')}*\n`
  text += '\n'

  if (missingMates.length > 0) {
    text += alliance + ' '
    text += `Missing (${missingMates.length}): `
    text += missingMates
      .sort((a, b) => a.player.localeCompare(b.player))
      .map(o => createPlayerMarkdownLink(o.user, o))
      .join(', ')
    text += '\n\n'
  }

  text += alliance + ' '
  text += `Participants (${participants.length}): `
  text += participants
    .map(o => createPlayerNameString({player: o}, true))
    .join(', ')
  text += '\n\n'

  text += 'Check /castle'

  await ctx.replyWithMarkdown(text)
}

bot.on('text', whenScreenContainsInformation('castleSiegeAllianceJoined', notNewMiddleware('forward.old', castleSiege.MAXIMUM_JOIN_SECONDS / 60), async ctx => {
  const {castleSiegeAllianceJoined, timestamp} = (ctx as any).state.screen as Gamescreen
  await castleSiege.add(timestamp, castleSiegeAllianceJoined!.alliance, undefined)
  return ctx.reply(`Thats fancy ${castleSiegeAllianceJoined!.alliance} joined but I dont know what to do with that information. 😇`)
}))

bot.on('text', whenScreenIsOfType('castleSiegeYouJoined', notNewMiddleware('forward.old', castleSiege.MAXIMUM_JOIN_SECONDS / 60), async ctx => {
  return ctx.reply('Thats fancy you joined but I currently only work with messages of others joining in. 😇')
}))
