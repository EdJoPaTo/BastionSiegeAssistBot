import {Composer} from 'telegraf'
import TelegrafInlineMenu from 'telegraf-inline-menu'

import {alertEmojis} from '../../lib/user-interface/alert-handler'
import {buttonText} from '../../lib/user-interface/menu'
import {emoji} from '../../lib/user-interface/output-text'

import * as alertsMenu from './alerts'
import * as buildingsMenu from './buildings'
import * as languageMenu from './language'
import * as listMenu from './list'
import * as poweruserMenu from './poweruser'

const settingsMenu = new TelegrafInlineMenu((ctx: any) => `*${ctx.i18n.t('settings')}*`)
settingsMenu.setCommand('settings')

settingsMenu.submenu(buttonText(alertEmojis.enabled, 'alerts'), 'alerts', alertsMenu.menu)

settingsMenu.submenu(buttonText(emoji.houses, 'bs.buildings'), 'buildings', buildingsMenu.menu)

settingsMenu.submenu(buttonText(emoji.language, 'language.title'), 'language', languageMenu.menu)

settingsMenu.submenu(buttonText(emoji.list, 'list.title'), 'list', listMenu.menu)

settingsMenu.submenu(buttonText(emoji.poweruser, 'poweruser.poweruser'), 'poweruser', poweruserMenu.menu)

export const bot = new Composer()
bot.use(settingsMenu.init({
  backButtonText: (ctx: any) => `🔙 ${ctx.i18n.t('menu.back')}…`,
  actionCode: 'settings'
}))

module.exports = {
  bot
}
