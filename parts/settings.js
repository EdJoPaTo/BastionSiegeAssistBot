const Telegraf = require('telegraf')
const TelegrafInlineMenu = require('telegraf-inline-menu')

const battlereports = require('../lib/data/battlereports')
const poweruser = require('../lib/data/poweruser')

const {emoji} = require('../lib/user-interface/output-emojis')
const {buildingNames, defaultBuildingsToShow} = require('../lib/user-interface/buildings')

const {ALERT_TYPES} = require('./alerts')

const settingsMenu = new TelegrafInlineMenu('*Settings*')
settingsMenu.setCommand('settings')

function alertsText() {
  let text = '*Alerts*'
  text += '\nEnable the alerts you want to get from me.'
  return text
}
settingsMenu.submenu('🔔 Alerts', 'a', new TelegrafInlineMenu(alertsText))
  .select('type', ALERT_TYPES, {
    multiselect: true,
    columns: 1,
    setFunc: (ctx, key) => {
      ctx.session.alerts = toggleInArray(ctx.session.alerts || [], key)
    },
    isSetFunc: (ctx, key) => (ctx.session.alerts || []).indexOf(key) >= 0 ? '🔔' : '🔕'
  })

function buildingsText() {
  let text = '*Buildings*'
  text += '\nYou can set which buildings are of interest for you in the /buildings view.'
  return text
}
settingsMenu.submenu(emoji.houses + 'Buildings', 's', new TelegrafInlineMenu(buildingsText))
  .select('b', buildingNames, {
    multiselect: true,
    columns: 2,
    setFunc: (ctx, key) => {
      ctx.session.buildings = toggleInArray(ctx.session.buildings || [...defaultBuildingsToShow], key)
    },
    isSetFunc: (ctx, key) => (ctx.session.buildings || [...defaultBuildingsToShow]).indexOf(key) >= 0
  })

function poweruserText(ctx) {
  let text = '*💙 Poweruser*'

  text += '\n'
  text += '\nYou are a poweruser! 😍'

  text += '\n'
  text += '\nIf you wish you can disable your immunity.'
  const {name} = ctx.session.gameInformation.player || {}
  const {disableImmunity} = ctx.session
  if (disableImmunity) {
    text += '\nCurrently *no one* will get immunity.'
  } else if (name) {
    text += '\nCurrently your immunity will be granted to:'
    text += '\n`' + name + '`'
    text += '\nSend your main menu screen from @BastionSiegeBot to update your current ingame name.'
  } else {
    text += '\nI do not have your name. *No one* will get immunity. Send me your main screen and I will grant you immunity.'
  }

  return text
}
settingsMenu.submenu('💙 Poweruser', 'p', new TelegrafInlineMenu(poweruserText), {
  hide: ctx => !poweruser.isPoweruser(battlereports.getAll(), ctx.from.id)
})
  .toggle('🛡 Immunity', 'immunity', {
    setFunc: (ctx, newState) => {
      if (newState) {
        delete ctx.session.disableImmunity
      } else {
        ctx.session.disableImmunity = true
      }
    },
    isSetFunc: ctx => {
      if (ctx.session.disableImmunity) {
        return false
      }
      const {name} = ctx.session.gameInformation.player || {}
      if (!name) {
        return '⚠️'
      }
      return true
    }
  })

function toggleInArray(array, key) {
  if (array.indexOf(key) >= 0) {
    array = array.filter(o => o !== key)
  } else {
    array.push(key)
    array.sort()
  }
  return array
}

const bot = new Telegraf.Composer()
bot.use(settingsMenu.init({
  backButtonText: '🔙 back…',
  actionCode: 'settings'
}))

module.exports = {
  bot
}
