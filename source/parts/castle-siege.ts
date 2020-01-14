import {Composer, ContextMessageUpdate} from 'telegraf'
import {CASTLES, castleGametext, Castle, CASTLE_HOLD_SECONDS} from 'bastion-siege-logic'
import arrayFilterUnique from 'array-filter-unique'
import debounce from 'debounce-promise'

import {whenScreenContainsInformation, whenScreenIsOfType} from '../lib/input/gamescreen'

import {ONE_DAY_IN_SECONDS} from '../lib/math/unix-timestamp'

import {Session} from '../lib/types'

import * as castles from '../lib/data/castles'
import * as castleSiege from '../lib/data/castle-siege'
import * as playerStatsDb from '../lib/data/playerstats-db'
import * as poweruser from '../lib/data/poweruser'
import * as userSessions from '../lib/data/user-sessions'

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
    .map(castle => {
      const keeper = castles.currentKeeperAlliance(castle)

      let part = ''
      if (keeper) {
        part += keeper
      }

      part += '*'
      part += castleGametext(castle, lang === 'ru' ? 'ru' : 'en')
      part += '*'
      part += '\n'
      part += castleFormattedTimestampBegin(castle, lang, timeZone)
      part += ' - '
      part += castleFormattedTimestampEnd(castle, lang, timeZone)

      if (castles.isCurrentlySiegeAvailable(castle, now)) {
        const participatingAlliances = [
          keeper,
          ...castleSiege.getAlliances(castle, now)
        ].filter(o => o).filter(arrayFilterUnique()) as string[]
        if (participatingAlliances.length > 0) {
          part += '\n'
          part += (ctx as any).i18n.t('bs.siege')
          part += ': '
          part += participatingAlliances.join('')
        }

        if (userIsPoweruser && alliance && participatingAlliances.includes(alliance)) {
          const participants = castleSiege.getParticipants(castle, alliance, now)
          const missingUsers = getMissingMates(alliance, participants.map(o => o.player), now)

          const knownNames = [
            ...missingUsers.map(o => o.player),
            ...participants.map(o => o.player)
          ]
          const missingNonUsers = playerStatsDb.getInAlliance(alliance, 7)
            .map(o => o.player)
            .filter(o => !knownNames.includes(o))

          const missingEntries: string[] = []
          missingEntries.push(...missingUsers
            .sort((a, b) => a.player.localeCompare(b.player))
            .map(o => createPlayerMarkdownLink(o.user, o))
          )
          missingEntries.push(...missingNonUsers
            .sort((a, b) => a.localeCompare(b))
            .map(o => createPlayerNameString({player: o}, true) + '?')
          )

          if (missingEntries.length > 0) {
            part += '\n'
            part += alliance + ' '
            part += `Missing (${missingEntries.length}): `
            part += missingEntries
              .join(', ')
          }

          part += '\n'
          part += alliance + ' '
          part += `Participants (${participants.length}): `
          part += participants
            .map(o => {
              const playerWithoutAlliance = {player: o.player}
              const userId = userSessions.getUserIdByName(o.player)
              return userId ?
                createPlayerMarkdownLink(userId, playerWithoutAlliance) :
                createPlayerNameString(playerWithoutAlliance, true)
            })
            .join(', ')
        }
      }

      return part
    })

  text += castleParts.join('\n\n')

  return ctx.replyWithMarkdown(text)
})

bot.on('text', whenScreenContainsInformation('castleSiegePlayerJoined', notNewMiddleware('forward.old', castleSiege.MAXIMUM_JOIN_SECONDS / 60), castleInformationUpdatedMiddleware))
bot.on('text', whenScreenContainsInformation('castleSiegeAllianceJoined', notNewMiddleware('forward.old', castleSiege.MAXIMUM_JOIN_SECONDS / 60), castleInformationUpdatedMiddleware))

bot.on('text', whenScreenIsOfType('castleSiegeYouJoined', notNewMiddleware('forward.old', castleSiege.MAXIMUM_JOIN_SECONDS / 60), async ctx => {
  return ctx.reply('Thats fancy you joined but I currently only work with messages of others joining in. 😇')
}))

bot.on('text', whenScreenContainsInformation('castleSiegeEnds', notNewMiddleware('forward.old', CASTLE_HOLD_SECONDS / 60), castleInformationUpdatedMiddleware))

const debouncedUpdated: Record<number, (ctx: ContextMessageUpdate) => Promise<unknown>> = {}
function castleInformationUpdatedMiddleware(ctx: ContextMessageUpdate): void {
  const {id} = ctx.from!
  if (!debouncedUpdated[id]) {
    debouncedUpdated[id] = debounce(
      async (ctx: ContextMessageUpdate) => ctx.reply((ctx as any).i18n.t('castle.updated')),
      DEBOUNCE_TIME
    )
  }

  debouncedUpdated[id](ctx)
}
