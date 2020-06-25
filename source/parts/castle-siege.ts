import {CASTLES, CASTLE_HOLD_SECONDS} from 'bastion-siege-logic'
import {Composer, Markup, Extra} from 'telegraf'
import {SwitchToChatButton} from 'telegraf/typings/markup'

import {ContextAwareDebounce} from '../lib/javascript-abstraction/context-aware-debounce'

import {whenScreenContainsInformation, whenScreenIsOfType} from '../lib/input/gamescreen'

import {Context} from '../lib/types'

import * as castleSiege from '../lib/data/castle-siege'
import * as poweruser from '../lib/data/poweruser'

import {notNewMiddleware} from '../lib/telegraf-middlewares'

import {castlePart, CastlePartOptions} from '../lib/user-interface/castle-siege'
import {emoji} from '../lib/user-interface/output-text'

const DEBOUNCE_TIME = 200 // Milliseconds

export const bot = new Composer<Context>()

bot.command('castle', async ctx => {
  const now = Date.now() / 1000
  const {__language_code: lang, timeZone, gameInformation} = ctx.session
  const userIsPoweruser = poweruser.isPoweruser(ctx.from!.id)

  let text = ''
  text += `*${ctx.i18n.t('bs.siege')}*\n`
  text += '\n'

  if (!userIsPoweruser) {
    text += emoji.poweruser
    text += ' '
    text += ctx.i18n.t('poweruser.usefulWhen')
    text += '\n\n'
  }

  const alliance = gameInformation.player?.alliance

  const options: CastlePartOptions = {
    userAlliance: alliance,
    locale: lang,
    now,
    timeZone,
    userIsPoweruser
  }

  const castleParts = CASTLES
    .map(castle => castlePart(castle, options))

  text += castleParts.join('\n\n')

  const buttons: SwitchToChatButton[] = []

  if (userIsPoweruser && alliance && castleSiege.getCastlesAllianceIsParticipatingInRecently(alliance, now).length > 0) {
    buttons.push(Markup.switchToChatButton('Share Siege…', 'siege'))
  }

  const extra = Extra.markup(Markup.inlineKeyboard(buttons))
  return ctx.replyWithMarkdown(text, extra)
})

bot.on('text', whenScreenContainsInformation('castleSiegePlayerJoined', notNewMiddleware('forward.old', castleSiege.MAXIMUM_JOIN_SECONDS / 60), castleInformationUpdatedMiddleware))
bot.on('text', whenScreenContainsInformation('castleSiegeAllianceJoined', notNewMiddleware('forward.old', castleSiege.MAXIMUM_JOIN_SECONDS / 60), castleInformationUpdatedMiddleware))

bot.on('text', whenScreenIsOfType('castleSiegeYouJoined', notNewMiddleware('forward.old', castleSiege.MAXIMUM_JOIN_SECONDS / 60), async ctx => {
  return ctx.reply('Thats fancy you joined but I currently only work with messages of others joining in. 😇')
}))

bot.on('text', whenScreenContainsInformation('castleSiegeEnds', notNewMiddleware('forward.old', CASTLE_HOLD_SECONDS / 60), castleInformationUpdatedMiddleware))

const debounceUpdatedCastle = new ContextAwareDebounce<number, (ctx: Context) => Promise<void>>(async (ctx: Context) => {
  const now = Date.now() / 1000
  const {castle, castleSiegePlayerJoined} = ctx.state!.screen
  if (castle) {
    await castleSiege.updateInlineMessages(castle, castleSiegePlayerJoined?.alliance, now)
  }

  await ctx.reply(ctx.i18n.t('castle.updated'))
}, DEBOUNCE_TIME)

function castleInformationUpdatedMiddleware(ctx: Context): void {
  debounceUpdatedCastle.callFloating(ctx.from!.id, ctx)
}
