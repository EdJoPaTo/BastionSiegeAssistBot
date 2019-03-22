const TelegrafInlineMenu = require('telegraf-inline-menu')

const playerStatsDb = require('../../lib/data/playerstats-db')
const poweruser = require('../../lib/data/poweruser')

const {emoji} = require('../../lib/user-interface/output-text')
const {createPlayerStatsString} = require('../../lib/user-interface/player-stats')
const {getHintStrings, conditionEmoji, conditionTypeTranslation} = require('../../lib/user-interface/poweruser')

function menuText(ctx) {
  let text = emoji.poweruser + ` *${ctx.i18n.t('poweruser.poweruser')}*\n`

  const isPoweruser = poweruser.isPoweruser(ctx.from.id)
  if (isPoweruser) {
    text += ctx.i18n.t('poweruser.youare') + ' 😍\n'
  } else {
    text += ctx.i18n.t('poweruser.notyet') + ' 😔\n'
  }

  const conditions = poweruser.getConditions(ctx.from.id)
  text += conditions
    .map(o => `${conditionEmoji(o)} ${conditionTypeTranslation(ctx, o.type)}`)
    .join('\n')

  if (isPoweruser) {
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
  }

  const hints = getHintStrings(ctx, conditions)
  if (hints.length > 0) {
    text += '\n\n' + hints
      .join('\n\n')
  }

  return text
}

const menu = new TelegrafInlineMenu(menuText)

menu.setCommand('poweruser')
menu.toggle(ctx => emoji.immunity + ' ' + ctx.i18n.t('poweruser.immunity'), 'immunity', {
  hide: ctx => !poweruser.isPoweruser(ctx.from.id),
  setFunc: (ctx, newState) => {
    if (newState) {
      delete ctx.session.disableImmunity
    } else {
      ctx.session.disableImmunity = true
    }
  },
  isSetFunc: ctx => !ctx.session.disableImmunity
})

module.exports = {
  menu
}
