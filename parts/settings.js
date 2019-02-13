const Telegraf = require('telegraf')
const TelegrafInlineMenu = require('telegraf-inline-menu')

const playerStatsDb = require('../lib/data/playerstats-db')
const poweruser = require('../lib/data/poweruser')

const {emoji} = require('../lib/user-interface/output-text')
const {buildingNames, defaultBuildingsToShow} = require('../lib/user-interface/buildings')
const {alertEmojis, ALERT_TYPES} = require('../lib/user-interface/alert-handler')
const {createPlayerStatsString} = require('../lib/user-interface/player-stats')

const settingsMenu = new TelegrafInlineMenu('*Settings*')
settingsMenu.setCommand('settings')

function alertsText() {
  let text = '*Alerts*'
  text += '\nEnable the alerts you want to get from me.'
  return text
}

settingsMenu.submenu(alertEmojis.enabled + ' Alerts', 'alerts', new TelegrafInlineMenu(alertsText))
  .select('type', ALERT_TYPES, {
    multiselect: true,
    columns: 1,
    setFunc: (ctx, key) => {
      ctx.session.alerts = toggleInArray(ctx.session.alerts || [], key)
    },
    isSetFunc: (ctx, key) => (ctx.session.alerts || []).includes(key) ? alertEmojis.enabled : alertEmojis.disabled
  })

function buildingsText() {
  let text = '*Buildings*'
  text += '\nYou can set which buildings are of interest for you in the /buildings view.'
  return text
}

settingsMenu.submenu(emoji.houses + 'Buildings', 'buildings', new TelegrafInlineMenu(buildingsText))
  .select('b', buildingNames, {
    multiselect: true,
    columns: 2,
    setFunc: (ctx, key) => {
      ctx.session.buildings = toggleInArray(ctx.session.buildings || [...defaultBuildingsToShow], key)
    },
    isSetFunc: (ctx, key) => (ctx.session.buildings || [...defaultBuildingsToShow]).includes(key)
  })

function poweruserText(ctx) {
  let text = emoji.poweruser + ' *Poweruser*'

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

  if (name) {
    const stats = playerStatsDb.get(name)
    text += '\n\n' + createPlayerStatsString(stats)
  }

  return text
}

settingsMenu.submenu(emoji.poweruser + ' Poweruser', 'poweruser', new TelegrafInlineMenu(poweruserText), {
  hide: ctx => !poweruser.isPoweruser(ctx.from.id)
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

function searchText(ctx) {
  const {remainingSearches} = ctx.session.search || {}

  let text = '🔎 *Search*'

  text += '\nRemaining searches: '
  text += Number(remainingSearches)

  text += '\n'
  text += '\nYou can search for player stats with multiple methods:'
  text += '\n• Using the *inline search*: Type in any chat `@BastionSiegeAssistBot <text>` to search for a player.'
  text += '\n• Forward the *Your scouts found* message from Bastion Siege to me.'
  text += '\n• Forward the *Your domain attacked* message to me'

  return text
}

settingsMenu.submenu('🔎 Search', 'search', new TelegrafInlineMenu(searchText))
  .switchToCurrentChatButton('try player search…', 'Dragon')

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
  backButtonText: '🔙 back…',
  actionCode: 'settings'
}))

module.exports = {
  bot
}
