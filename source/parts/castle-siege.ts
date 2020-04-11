import {Composer, ContextMessageUpdate} from 'telegraf'
import {CASTLES, CASTLE_HOLD_SECONDS} from 'bastion-siege-logic'
import debounce from 'debounce-promise'

import {whenScreenContainsInformation, whenScreenIsOfType} from '../lib/input/gamescreen'

import {Session} from '../lib/types'

import * as castleSiege from '../lib/data/castle-siege'
import * as poweruser from '../lib/data/poweruser'

import {notNewMiddleware} from '../lib/telegraf-middlewares'

import {castlePart, CastlePartOptions} from '../lib/user-interface/castle-siege'
import {emoji} from '../lib/user-interface/output-text'

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

  const options: CastlePartOptions = {
    userAlliance: gameInformation.player?.alliance,
    locale: lang,
    now,
    timeZone,
    userIsPoweruser
  }

  const castleParts = CASTLES
    .map(castle => castlePart(castle, options))

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
