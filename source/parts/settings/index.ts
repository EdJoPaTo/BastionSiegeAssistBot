import {Composer} from 'telegraf'
import {MenuTemplate, MenuMiddleware} from 'telegraf-inline-menu'

import {Context} from '../../lib/types'

import {buttonText} from '../../lib/user-interface/menu'
import {emoji} from '../../lib/user-interface/output-text'

import * as alertsMenu from './alerts'
import * as buildingsMenu from './buildings'
import * as languageMenu from './language'
import * as timezoneMenu from './timezone'
import * as listMenu from './list'
import * as poweruserMenu from './poweruser'

const settingsMenu = new MenuTemplate<Context>(ctx => ({text: `*${ctx.i18n.t('settings')}*`, parse_mode: 'Markdown'}))

settingsMenu.submenu(buttonText(emoji.alertEnabled, 'alerts'), 'alerts', alertsMenu.menu)

settingsMenu.submenu(buttonText(emoji.houses, 'bs.buildings'), 'buildings', buildingsMenu.menu)

settingsMenu.submenu(buttonText(emoji.language, 'language.title'), 'language', languageMenu.menu)

settingsMenu.submenu(buttonText(emoji.timezone, 'setting.timezone'), 'timezone', timezoneMenu.menu)

settingsMenu.submenu(buttonText(emoji.list, 'list.title'), 'list', listMenu.menu)

settingsMenu.submenu(buttonText(emoji.poweruser, 'poweruser.poweruser'), 'poweruser', poweruserMenu.menu)

const menuMiddleware = new MenuMiddleware('settings/', settingsMenu)

export const bot = new Composer<Context>()
bot.command('settings', async ctx => menuMiddleware.replyToContext(ctx))
bot.use(menuMiddleware)
