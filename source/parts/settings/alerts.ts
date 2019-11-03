import TelegrafInlineMenu from 'telegraf-inline-menu'

import {toggleInArray} from '../../lib/javascript-abstraction/array'

import {Session, ALERTS, Alert} from '../../lib/types'

import {emoji} from '../../lib/user-interface/output-text'
import {getAlertText} from '../../lib/user-interface/alert-handler'

function menuText(ctx: any): string {
  let text = `*${ctx.i18n.t('alerts')}*`
  text += '\n'
  text += ctx.i18n.t('setting.alert.infotext')
  return text
}

export const menu = new TelegrafInlineMenu(menuText)

menu.select('type', ALERTS, {
  multiselect: true,
  columns: 1,
  prefixTrue: emoji.alertEnabled,
  prefixFalse: emoji.alertDisabled,
  textFunc: (ctx, key) => getAlertText(ctx, key as Alert),
  setFunc: (ctx: any, key) => {
    const session = ctx.session as Session
    session.alerts = toggleInArray(session.alerts || [], key as Alert)
  },
  isSetFunc: (ctx: any, key) => {
    const session = ctx.session as Session
    return (session.alerts || []).includes(key as Alert)
  }
})
