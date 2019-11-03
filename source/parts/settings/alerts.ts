import TelegrafInlineMenu from 'telegraf-inline-menu'

import {toggleInArray} from '../../lib/javascript-abstraction/array'

import {Session} from '../../lib/types'

import {alertEmojis, ALERT_TYPES, getAlertText} from '../../lib/user-interface/alert-handler'

function menuText(ctx: any): string {
  let text = `*${ctx.i18n.t('alerts')}*`
  text += '\n'
  text += ctx.i18n.t('setting.alert.infotext')
  return text
}

export const menu = new TelegrafInlineMenu(menuText)

menu.select('type', ALERT_TYPES, {
  multiselect: true,
  columns: 1,
  prefixTrue: alertEmojis.enabled,
  prefixFalse: alertEmojis.disabled,
  textFunc: getAlertText,
  setFunc: (ctx: any, key) => {
    const session = ctx.session as Session
    session.alerts = toggleInArray(session.alerts || [], key)
  },
  isSetFunc: (ctx: any, key) => {
    const session = ctx.session as Session
    return (session.alerts || []).includes(key)
  }
})

module.exports = {
  menu
}
