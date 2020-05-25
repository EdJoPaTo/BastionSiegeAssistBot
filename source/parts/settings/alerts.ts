import {MenuTemplate, Body} from 'telegraf-inline-menu'

import {toggleInArray} from '../../lib/javascript-abstraction/array'

import {Context, ALERTS, Alert} from '../../lib/types'

import {backButtons} from '../../lib/user-interface/menu'
import {emoji} from '../../lib/user-interface/output-text'
import {getAlertText} from '../../lib/user-interface/alert-handler'

function menuBody(ctx: Context): Body {
  let text = `*${ctx.i18n.t('alerts')}*`
  text += '\n'
  text += ctx.i18n.t('setting.alert.infotext')
  return {text, parse_mode: 'Markdown'}
}

export const menu = new MenuTemplate<Context>(menuBody)

menu.select('type', ALERTS, {
  columns: 1,
  buttonText: (ctx, key) => getAlertText(ctx, key as Alert),
  formatState: (_, textResult, state) => `${state ? emoji.alertEnabled : emoji.alertDisabled} ${textResult}`,
  set: (ctx, key) => {
    ctx.session.alerts = toggleInArray(ctx.session.alerts ?? [], key as Alert, (a, b) => a.localeCompare(b))
  },
  isSet: (ctx, key) => (ctx.session.alerts ?? []).includes(key as Alert)
})

menu.manualRow(backButtons)
