const Telegraf = require('telegraf')
const TelegrafInlineMenu = require('telegraf-inline-menu')

const {emoji} = require('../lib/gamescreen.emoji')
const {buildingNames, defaultBuildingsToShow} = require('../lib/buildings')

const settingsMenu = new TelegrafInlineMenu('*Settings*')
settingsMenu.setCommand('settings')

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
