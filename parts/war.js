const Telegraf = require('telegraf')

const battlereports = require('../lib/data/battlereports')
const poweruser = require('../lib/data/poweruser')

const playerStats = require('../lib/math/player-stats')

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
  let text = '*War*'
  let extra = Extra.markdown()

  const statsStrings = []
  statsStrings.push(formatNumberShort(domainStats.wins, true) + emoji.wins)
  statsStrings.push(formatNumberShort(domainStats.karma, true) + emoji.karma)
  statsStrings.push(formatNumberShort(domainStats.terra, true) + emoji.terra)
  text += '\n' + statsStrings.join(' ')

  if (battle) {
    const allBattlereports = battlereports.getAll()
    text += '\n\n'

    const time = ctx.message.forward_date
    const now = Date.now() / 1000
    const minutesAgo = (now - time) / 60
    if (minutesAgo > 8) {
      text += 'This battle is long over… Send me the report instead. 😉'
      return ctx.replyWithMarkdown(text)
    }

    if (battle.enemy) {
      const stats = playerStats.generate(allBattlereports, battle.enemy)
      text += createPlayerStatsString(stats)
      extra = extra.markup(
        Markup.inlineKeyboard([
          createPlayerShareButton(stats)
        ])
      )
    } else {
      const additionalArmyInformation = {}

      const allPlayersInvolved = []
        .concat(battle.attack || [])
        .concat(battle.defence || [])
      const {name} = ctx.session.gameInformation.player || {}
      if (allPlayersInvolved.length > 0 && (!name || allPlayersInvolved.indexOf(name) < 0)) {
        text += 'I need your name for that. Send me your main screen first. 😅'
        return ctx.replyWithMarkdown(text)
      }

      const requesterIsPoweruser = poweruser.isPoweruser(allBattlereports, ctx.from.id)
      const minimumBuildingTimestamp = now - MINIMUM_AGE_OF_BUILDINGS_IN_SECONDS
      const buildingsAreUpToDate = ctx.session.gameInformation.buildingsTimestamp > minimumBuildingTimestamp
      if (requesterIsPoweruser && buildingsAreUpToDate) {
        const friends = battle.attack.indexOf(name) >= 0 ? battle.attack : battle.defence
        const poweruserFriends = poweruser.getPoweruserSessions(allBattlereports)
          .map(o => o.data.gameInformation)
          .filter(o => o.player && friends.indexOf(o.player.name) >= 0)
          .filter(o => o.buildingsTimestamp > minimumBuildingTimestamp)
          .map(o => ({
            alliance: o.player.alliance,
            player: o.player.name,
            barracks: o.buildings.barracks,
            army: o.buildings.barracks * 40
          }))

        for (const o of poweruserFriends) {
          additionalArmyInformation[o.player] = o.army
        }

        const notPowerusers = friends
          .filter(o => poweruserFriends.map(o => o.player).indexOf(o) < 0)
        if (notPowerusers.length > 0) {
          const notPoweruserString = notPowerusers
            .map(o => createPlayerNameString({player: o}, true))
            .join(', ')

          text += 'Not powerusers or buildings not up to date:\n'
          text += notPoweruserString
        }
      } else {
        text += '💙😎 When you are poweruser and your buildings are up to date you will get improved information about alliance mates.'
      }
      text += '\n\n'

      const attackStats = battle.attack
        .map(o => playerStats.generate(allBattlereports, o))
      const defenceStats = battle.defence
        .map(o => playerStats.generate(allBattlereports, o))
      text += createTwoSidesStatsString(attackStats, defenceStats, additionalArmyInformation)

      const buttons = [...attackStats, ...defenceStats]
        .filter(o => !o.immune)
        .map(o => createPlayerShareButton(o))
      extra = extra.markup(
        Markup.inlineKeyboard(buttons, {columns: 1})
      )
    }
  }

  return ctx.reply(text, extra)
}))

module.exports = {
  bot
}
