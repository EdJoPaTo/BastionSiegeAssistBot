import {Composer, ContextMessageUpdate} from 'telegraf'
import {CASTLES, CASTLE_HOLD_SECONDS} from 'bastion-siege-logic'
import arrayFilterUnique from 'array-filter-unique'
import debounce from 'debounce-promise'

import {whenScreenContainsInformation, whenScreenIsOfType} from '../lib/input/gamescreen'

import {Session} from '../lib/types'

import * as castles from '../lib/data/castles'
import * as castleSiege from '../lib/data/castle-siege'
import * as poweruser from '../lib/data/poweruser'
import * as userSessions from '../lib/data/user-sessions'

import {notNewMiddleware} from '../lib/telegraf-middlewares'

import {castleHeader} from '../lib/user-interface/castle-siege'
import {createPlayerMarkdownLink, createPlayerNameString} from '../lib/user-interface/player-stats'
import {emoji} from '../lib/user-interface/output-text'
import {getMissingAllianceMateMarkdownList} from '../lib/user-interface/alliance'

const DEBOUNCE_TIME = 200 // Milliseconds

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
      part += castleHeader(castle, keeper, lang, timeZone)

      if (castles.isCurrentlySiegeAvailable(castle, now)) {
        const participatingAlliances = [
          keeper,
          ...castleSiege.getAlliances(castle, now)
        ].filter(o => o).filter(arrayFilterUnique()) as string[]
        const onlyAttackers = participatingAlliances
          .filter(o => o !== keeper)
        if (onlyAttackers.length > 0) {
          part += (ctx as any).i18n.t('bs.siege')
          part += ': '
          part += onlyAttackers.join('')
          part += '\n'
        }

        if (userIsPoweruser && alliance && participatingAlliances.includes(alliance)) {
          const participants = castleSiege.getParticipants(castle, alliance, now)

          const missing = getMissingAllianceMateMarkdownList(alliance, participants.map(o => o.player))
          if (missing.length > 0) {
            part += alliance + ' '
            part += `Missing (${missing.length}): `
            part += missing
              .join(', ')
            part += '\n'
          }

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
          part += '\n'
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
