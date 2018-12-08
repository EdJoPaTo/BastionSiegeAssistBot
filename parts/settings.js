const Telegraf = require('telegraf')
const TelegrafInlineMenu = require('telegraf-inline-menu')

const {emoji} = require('../lib/gamescreen.emoji')
const {buildingNames, defaultBuildingsToShow} = require('../lib/buildings')

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
