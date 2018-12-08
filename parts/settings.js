const Telegraf = require('telegraf')
const TelegrafInlineMenu = require('telegraf-inline-menu')

const {buildingNames, defaultBuildingsToShow} = require('../lib/buildings')

const settingsMenu = new TelegrafInlineMenu('*Settings*')
settingsMenu.setCommand('settings')

function buildingsText() {
  let text = '*Buildings*'
  text += '\nYou can set which buildings are of interest for you in the /buildings view.'

  return text
}

const buildingsMenu = settingsMenu.submenu('Buildings', 's', new TelegrafInlineMenu(buildingsText))

buildingsMenu.select('b', buildingNames, {
  multiselect: true,
  columns: 2,
  setFunc: (ctx, key) => {
    if (!ctx.session.buildings) {
      ctx.session.buildings = [...defaultBuildingsToShow]
    }
    if (ctx.session.buildings.indexOf(key) >= 0) {
      ctx.session.buildings = ctx.session.buildings.filter(o => o !== key)
    } else {
      ctx.session.buildings.push(key)
      ctx.session.buildings.sort()
    }
  },
  isSetFunc: (ctx, key) => (ctx.session.buildings || [...defaultBuildingsToShow]).indexOf(key) >= 0
})

const bot = new Telegraf.Composer()
bot.use(settingsMenu.init({
  backButtonText: '🔙 back…',
  actionCode: 'settings'
}))

module.exports = {
  bot
}
