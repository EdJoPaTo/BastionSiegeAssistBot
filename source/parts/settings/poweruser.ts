import {MenuTemplate, Body} from 'telegraf-inline-menu'

import {Context} from '../../lib/types'

import * as playerStatsDb from '../../lib/data/playerstats-db'
import * as poweruser from '../../lib/data/poweruser'

import {buttonText, backButtons} from '../../lib/user-interface/menu'
import {createPlayerStatsString} from '../../lib/user-interface/player-stats'
import {emoji} from '../../lib/user-interface/output-text'
import {getHintStrings, conditionEmoji, conditionTypeTranslation} from '../../lib/user-interface/poweruser'

function menuBody(ctx: Context): Body {
  let text = emoji.poweruser + ` *${ctx.i18n.t('poweruser.poweruser')}*\n`

  const isPoweruser = poweruser.isPoweruser(ctx.from!.id)
  if (isPoweruser) {
    text += `${ctx.i18n.t('poweruser.youare')} 😍\n`
  } else {
    text += `${ctx.i18n.t('poweruser.notyet')} 😔\n`
  }

  const conditions = poweruser.getConditions(ctx.from!.id)
  text += conditions
    .map(o => `${conditionEmoji(o)} ${conditionTypeTranslation(ctx, o.type)}`)
    .join('\n')

  if (isPoweruser) {
    text += '\n'
    const {name} = ctx.session.gameInformation.player!
    if (ctx.session.disableImmunity) {
      text += '\n'
      text += ctx.i18n.t('poweruser.immunityDisabled')
    } else {
      text += '\n'
      text += ctx.i18n.t('poweruser.immunityTo', {name: '`' + name + '`'})

      text += '\n'
      text += ctx.i18n.t('name.update')
    }

    if (name) {
      const stats = playerStatsDb.get(name)
      text += '\n\n'
      text += createPlayerStatsString(stats, ctx.session.timeZone || 'UTC')
    }
  }

  const hints = getHintStrings(ctx, conditions)
  if (hints.length > 0) {
    text += '\n\n'
    text += hints
      .join('\n\n')
  }

  return {text, parse_mode: 'Markdown'}
}

export const menu = new MenuTemplate<Context>(menuBody)

menu.toggle(buttonText(emoji.immunity, 'poweruser.immunity'), 'immunity', {
  hide: ctx => !poweruser.isPoweruser(ctx.from!.id),
  set: (ctx, newState) => {
    if (newState) {
      delete ctx.session.disableImmunity
    } else {
      ctx.session.disableImmunity = true
    }

    return true
  },
  isSet: ctx => {
    return !ctx.session.disableImmunity
  }
})

menu.manualRow(backButtons)
