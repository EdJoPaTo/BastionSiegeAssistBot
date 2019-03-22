const TelegrafInlineMenu = require('telegraf-inline-menu')

const {toggleInArray} = require('../../lib/javascript-abstraction/array')

const {BUILDINGS, getBuildingText, defaultBuildingsToShow} = require('../../lib/user-interface/buildings')

function menuText(ctx) {
  let text = `*${ctx.i18n.t('bs.buildings')}*`
  text += '\n' + ctx.i18n.t('setting.buildings.infotext')
  return text
}

const menu = new TelegrafInlineMenu(menuText)

menu.select('b', BUILDINGS, {
  multiselect: true,
  columns: 2,
  textFunc: getBuildingText,
  setFunc: (ctx, key) => {
    ctx.session.buildings = toggleInArray(ctx.session.buildings || [...defaultBuildingsToShow], key)
  },
  isSetFunc: (ctx, key) => (ctx.session.buildings || [...defaultBuildingsToShow]).includes(key)
})

module.exports = {
  menu
}
