const Telegraf = require('telegraf')

const {calcBarracksCapacity} = require('../lib/math/siegemath')

const playerStatsDb = require('../lib/data/playerstats-db')
const poweruser = require('../lib/data/poweruser')

const {createPlayerShareButton, createPlayerNameString, createPlayerStatsString, createTwoSidesStatsString} = require('../lib/user-interface/player-stats')
const {emoji} = require('../lib/user-interface/output-text')
const {formatNumberShort} = require('../lib/user-interface/format-number')

const {Extra, Markup} = Telegraf

const MINIMUM_AGE_OF_BUILDINGS_IN_SECONDS = 60 * 60 * 24 * 1 // 1 Days

const bot = new Telegraf.Composer()

function isWarMenu(ctx) {
  return ctx.state.screen &&
    ctx.state.screen.type === 'war'
}

bot.on('text', Telegraf.optional(isWarMenu, ctx => {
  const {domainStats, battle} = ctx.state.screen.information
  let text = `*${ctx.i18n.t('bs.war')}*\n`
  let extra = Extra.markdown()

  const statsStrings = []
  statsStrings.push(formatNumberShort(domainStats.wins, true) + emoji.wins)
  statsStrings.push(formatNumberShort(domainStats.karma, true) + emoji.karma)
  statsStrings.push(formatNumberShort(domainStats.terra, true) + emoji.terra)
  if (!battle) {
    text += statsStrings.join(' ')
  }

  if (battle) {
    const time = ctx.message.forward_date
    const now = Date.now() / 1000
    const minutesAgo = (now - time) / 60
    if (minutesAgo > 8) {
      text += ctx.i18n.t('battle.over')
      return ctx.replyWithMarkdown(text)
    }

    if (battle.enemy) {
      const stats = playerStatsDb.get(battle.enemy)
      text += '\n'
      text += createPlayerStatsString(stats)
      extra = extra.markup(
        Markup.inlineKeyboard([
          createPlayerShareButton(stats)
        ])
      )
    } else {
      const minimumBuildingTimestamp = now - MINIMUM_AGE_OF_BUILDINGS_IN_SECONDS
      const buildingsAreUpToDate = ctx.session.gameInformation.buildingsTimestamp > minimumBuildingTimestamp
      if (!buildingsAreUpToDate || !poweruser.isPoweruser(ctx.from.id)) {
        text += ctx.i18n.t('battle.improvedArmyAsPoweruser')
        return ctx.replyWithMarkdown(text)
      }

      const allPlayersInvolved = []
        .concat(battle.attack || [])
        .concat(battle.defence || [])
      const {name} = ctx.session.gameInformation.player || {}
      if (allPlayersInvolved.length > 0 && (!name || !allPlayersInvolved.includes(name))) {
        text += ctx.i18n.t('name.need')
        return ctx.replyWithMarkdown(text)
      }

      const friends = battle.attack.includes(name) ? battle.attack : battle.defence
      const poweruserFriends = poweruser.getPoweruserSessions()
        .map(o => o.data.gameInformation)
        .filter(o => o.player && friends.includes(o.player.name))
        .filter(o => o.buildingsTimestamp > minimumBuildingTimestamp)
        .map(o => ({
          alliance: o.player.alliance,
          player: o.player.name,
          barracks: o.buildings.barracks,
          army: calcBarracksCapacity(o.buildings.barracks)
        }))

      const additionalArmyInformation = {}
      for (const o of poweruserFriends) {
        additionalArmyInformation[o.player] = o.army
      }

      const notPowerusers = friends
        .filter(o => !poweruserFriends.map(o => o.player).includes(o))
      if (notPowerusers.length > 0) {
        const notPoweruserString = notPowerusers
          .map(o => createPlayerNameString({player: o}, true))
          .join(', ')

        text += ctx.i18n.t('battle.playersNotPowerusersOrBuildingsOld') + ':\n'
        text += notPoweruserString
        text += '\n\n'
      }

      const attackStats = battle.attack
        .map(o => playerStatsDb.get(o))
      const defenceStats = battle.defence
        .map(o => playerStatsDb.get(o))
      text += createTwoSidesStatsString(attackStats, defenceStats, additionalArmyInformation)

      const buttons = [...attackStats, ...defenceStats]
        .filter(o => !poweruser.isImmune(o.player))
        .map(o => createPlayerShareButton(o))
      extra = extra.markup(
        Markup.inlineKeyboard(buttons, {columns: 2})
      )
    }
  }

  return ctx.reply(text, extra)
}))

module.exports = {
  bot
}
