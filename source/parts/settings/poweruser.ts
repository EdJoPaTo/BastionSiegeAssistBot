import TelegrafInlineMenu from 'telegraf-inline-menu'

import {Session} from '../../lib/types'

import * as playerStatsDb from '../../lib/data/playerstats-db'
import * as poweruser from '../../lib/data/poweruser'

import {buttonText} from '../../lib/user-interface/menu'
import {createPlayerStatsString} from '../../lib/user-interface/player-stats'
import {emoji} from '../../lib/user-interface/output-text'
import {getHintStrings, conditionEmoji, conditionTypeTranslation} from '../../lib/user-interface/poweruser'

function menuText(ctx: any): string {
  const session = ctx.session as Session
  let text = emoji.poweruser + ` *${ctx.i18n.t('poweruser.poweruser')}*\n`

  const isPoweruser = poweruser.isPoweruser(ctx.from.id)
  if (isPoweruser) {
    text += `${ctx.i18n.t('poweruser.youare')} 😍\n`
  } else {
    text += `${ctx.i18n.t('poweruser.notyet')} 😔\n`
  }

  const conditions = poweruser.getConditions(ctx.from.id)
  text += conditions
    .map(o => `${conditionEmoji(o)} ${conditionTypeTranslation(ctx, o.type)}`)
    .join('\n')

  if (isPoweruser) {
    text += '\n'
    const {name} = session.gameInformation.player || {}
    if (session.disableImmunity) {
      text += '\n'
      text += ctx.i18n.t('poweruser.immunityDisabled')
    } else {
      text += '\n'
      if (name) {
        text += ctx.i18n.t('poweruser.immunityTo', {name: '`' + name + '`'})
      } else {
        text += ctx.i18n.t('poweruser.noname')
      }

      text += '\n'
      text += ctx.i18n.t('name.update')
    }

    if (name) {
      const stats = playerStatsDb.get(name)
      text += '\n\n'
      text += createPlayerStatsString(stats)
    }
  }

  const hints = getHintStrings(ctx, conditions)
  if (hints.length > 0) {
    text += '\n\n'
    text += hints
      .join('\n\n')
  }

  return text
}

export const menu = new TelegrafInlineMenu(menuText)

menu.setCommand('poweruser')
menu.toggle(buttonText(emoji.immunity, 'poweruser.immunity'), 'immunity', {
  hide: ctx => !poweruser.isPoweruser(ctx.from!.id),
  setFunc: (ctx: any, newState) => {
    const session = ctx.session as Session
    if (newState) {
      delete session.disableImmunity
    } else {
      session.disableImmunity = true
    }
  },
  isSetFunc: (ctx: any) => {
    const session = ctx.session as Session
    return !session.disableImmunity
  }
})

module.exports = {
  menu
}
