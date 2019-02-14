const Telegraf = require('telegraf')
const TelegrafInlineMenu = require('telegraf-inline-menu')
const countryEmoji = require('country-emoji')

const playerStatsDb = require('../lib/data/playerstats-db')
const poweruser = require('../lib/data/poweruser')

const {emoji} = require('../lib/user-interface/output-text')
const {BUILDINGS, getBuildingText, defaultBuildingsToShow} = require('../lib/user-interface/buildings')
const {alertEmojis, ALERT_TYPES, getAlertText} = require('../lib/user-interface/alert-handler')
const {createPlayerStatsString} = require('../lib/user-interface/player-stats')

const AVAILABLE_LANGUAGES = [
  'de',
  'en-GB'
]

const settingsMenu = new TelegrafInlineMenu(ctx => `*${ctx.i18n.t('settings')}*`)
settingsMenu.setCommand('settings')

function alertsText(ctx) {
  let text = `*${ctx.i18n.t('alerts')}*`
  text += '\n' + ctx.i18n.t('setting.alert.infotext')
  return text
}

settingsMenu.submenu(ctx => alertEmojis.enabled + ' ' + ctx.i18n.t('alerts'), 'alerts', new TelegrafInlineMenu(alertsText))
  .select('type', ALERT_TYPES, {
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

function buildingsText(ctx) {
  let text = `*${ctx.i18n.t('bs.buildings')}*`
  text += '\n' + ctx.i18n.t('setting.buildings.infotext')
  return text
}

settingsMenu.submenu(ctx => emoji.houses + ' ' + ctx.i18n.t('bs.buildings'), 'buildings', new TelegrafInlineMenu(buildingsText))
  .select('b', BUILDINGS, {
    multiselect: true,
    columns: 2,
    textFunc: getBuildingText,
    setFunc: (ctx, key) => {
      ctx.session.buildings = toggleInArray(ctx.session.buildings || [...defaultBuildingsToShow], key)
    },
    isSetFunc: (ctx, key) => (ctx.session.buildings || [...defaultBuildingsToShow]).includes(key)
  })

function languageText(ctx) {
  let text = emoji.language + ` *${ctx.i18n.t('language.title')}*`
  text += '\n' + ctx.i18n.t('language.info')
  return text
}

settingsMenu.submenu(ctx => emoji.language + ' ' + ctx.i18n.t('language.title'), 'language', new TelegrafInlineMenu(languageText))
  .select('lang', AVAILABLE_LANGUAGES, {
    isSetFunc: (ctx, key) => key.toLowerCase().startsWith(ctx.i18n.locale().toLowerCase()),
    setFunc: (ctx, key) => ctx.i18n.locale(key),
    textFunc: (_ctx, key) => {
      const countryCode = key.split('-').slice(-1)[0]
      const lang = key.split('-')[0]
      return countryEmoji.flag(countryCode) + ' ' + lang
    }
  })
  .urlButton('Join BastionSiegeAssist Support Group', 'https://t.me/joinchat/AC0dV1dG2Y7sOFQPtZm9Dw')

function poweruserText(ctx) {
  let text = emoji.poweruser + ` *${ctx.i18n.t('poweruser.poweruser')}*`

  text += '\n\n'
  text += ctx.i18n.t('poweruser.youare') + ' 😍'

  text += '\n'
  const {name} = ctx.session.gameInformation.player || {}
  const {disableImmunity} = ctx.session
  if (disableImmunity) {
    text += '\n' + ctx.i18n.t('poweruser.immunityDisabled')
  } else {
    if (name) {
      text += '\n' + ctx.i18n.t('poweruser.immunityTo', {name: '`' + name + '`'})
    } else {
      text += '\n' + ctx.i18n.t('poweruser.noname')
    }

    text += '\n' + ctx.i18n.t('name.update')
  }

  if (name) {
    const stats = playerStatsDb.get(name)
    text += '\n\n' + createPlayerStatsString(stats)
  }

  return text
}

settingsMenu.submenu(ctx => emoji.poweruser + ' ' + ctx.i18n.t('poweruser.poweruser'), 'poweruser', new TelegrafInlineMenu(poweruserText), {
  hide: ctx => !poweruser.isPoweruser(ctx.from.id)
})
  .toggle(ctx => emoji.immunity + ' ' + ctx.i18n.t('poweruser.immunity'), 'immunity', {
    setFunc: (ctx, newState) => {
      if (newState) {
        delete ctx.session.disableImmunity
      } else {
        ctx.session.disableImmunity = true
      }
    },
    isSetFunc: ctx => !ctx.session.disableImmunity
  })

function toggleInArray(array, key) {
  if (array.includes(key)) {
    array = array.filter(o => o !== key)
  } else {
    array.push(key)
    array.sort()
  }

  return array
}

const bot = new Telegraf.Composer()
bot.use(settingsMenu.init({
  backButtonText: ctx => `🔙 ${ctx.i18n.t('menu.back')}…`,
  actionCode: 'settings'
}))

module.exports = {
  bot
}
