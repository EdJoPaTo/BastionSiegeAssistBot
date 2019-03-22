const Telegraf = require('telegraf')
const TelegrafInlineMenu = require('telegraf-inline-menu')

const {emoji} = require('../lib/user-interface/output-text')
const {alertEmojis} = require('../lib/user-interface/alert-handler')

const alertsMenu = require('./settings-submenus/alerts')
const buildingsMenu = require('./settings-submenus/buildings')
const languageMenu = require('./settings-submenus/language')
const poweruserMenu = require('./settings-submenus/poweruser')

const settingsMenu = new TelegrafInlineMenu(ctx => `*${ctx.i18n.t('settings')}*`)
settingsMenu.setCommand('settings')

settingsMenu.submenu(ctx => alertEmojis.enabled + ' ' + ctx.i18n.t('alerts'), 'alerts', alertsMenu.menu)

settingsMenu.submenu(ctx => emoji.houses + ' ' + ctx.i18n.t('bs.buildings'), 'buildings', buildingsMenu.menu)

settingsMenu.submenu(ctx => emoji.language + ' ' + ctx.i18n.t('language.title'), 'language', languageMenu.menu)

settingsMenu.submenu(ctx => emoji.poweruser + ' ' + ctx.i18n.t('poweruser.poweruser'), 'poweruser', poweruserMenu.menu)

const bot = new Telegraf.Composer()
bot.use(settingsMenu.init({
  backButtonText: ctx => `🔙 ${ctx.i18n.t('menu.back')}…`,
  actionCode: 'settings'
}))

module.exports = {
  bot
}
