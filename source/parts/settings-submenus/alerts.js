const TelegrafInlineMenu = require('telegraf-inline-menu')

const {toggleInArray} = require('../../lib/javascript-abstraction/array')

const {alertEmojis, ALERT_TYPES, getAlertText} = require('../../lib/user-interface/alert-handler')

function menuText(ctx) {
  let text = `*${ctx.i18n.t('alerts')}*`
  text += '\n' + ctx.i18n.t('setting.alert.infotext')
  return text
}

const menu = new TelegrafInlineMenu(menuText)

menu.select('type', ALERT_TYPES, {
  multiselect: true,
  columns: 1,
  prefixTrue: alertEmojis.enabled,
  prefixFalse: alertEmojis.disabled,
  textFunc: getAlertText,
  setFunc: (ctx, key) => {
    ctx.session.alerts = toggleInArray(ctx.session.alerts || [], key)
  },
  isSetFunc: (ctx, key) => {
    return (ctx.session.alerts || []).includes(key)
  }
})

module.exports = {
  menu
}
