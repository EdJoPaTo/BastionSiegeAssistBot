const Telegraf = require('telegraf')

const battlereports = require('../lib/data/battlereports')
const poweruser = require('../lib/data/poweruser')

const playerStats = require('../lib/math/player-stats')
const {getSumAverageAmount} = require('../lib/math/number-array')

const {createAverageSumString} = require('../lib/user-interface/number-array-strings')
const {createPlayerShareButton, createPlayerNameString, createPlayerStatsTwoLineString} = require('../lib/user-interface/player-stats')
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

    const allPlayersInvolved = []
      .concat(battle.attack || [])
      .concat(battle.defence || [])
    const {name} = ctx.session.gameInformation.player || {}
    if (allPlayersInvolved.length > 0 && (!name || allPlayersInvolved.indexOf(name) < 0)) {
      text += 'I need your name for that. Send me your main screen first. 😅'
      return ctx.replyWithMarkdown(text)
    }

    const enemies = getRelevantPlayersFromBattle(battle, name)
    const friends = allPlayersInvolved.length === 0 ?
      [name] :
      allPlayersInvolved.filter(o => enemies.indexOf(o) < 0)

    const enemyStats = enemies
      .map(o => playerStats.generate(allBattlereports, o))

    if (friends.length > 1 || enemies.length > 1) {
      text += ctx.session.gameInformation.player.alliance
      text += ` ${friends.length} | ${enemies.length} `
      text += enemyStats[0].alliance
      text += '\n\n'
    }

    const requesterIsPoweruser = poweruser.isPoweruser(allBattlereports, ctx.from.id)
    const minimumBuildingTimestamp = now - MINIMUM_AGE_OF_BUILDINGS_IN_SECONDS
    const buildingsAreUpToDate = ctx.session.gameInformation.buildingsTimestamp > minimumBuildingTimestamp
    if (requesterIsPoweruser && buildingsAreUpToDate) {
      const poweruserFriends = poweruser.getPoweruserSessions(allBattlereports)
        .map(o => o.data.gameInformation)
        .filter(o => o.player && friends.indexOf(o.player.name) >= 0)
        .filter(o => o.buildingsTimestamp > minimumBuildingTimestamp)
        .map(o => ({
          alliance: o.player.alliance,
          player: o.player.name,
          barracks: o.buildings.barracks
        }))
      const poweruserFriendNames = poweruserFriends.map(o => o.player)
      const friendlyKnownArmyArr = poweruserFriends.map(o => o.barracks * 40)
      const friendlyKnownArmy = getSumAverageAmount(friendlyKnownArmyArr)
      text += createAverageSumString(
        friendlyKnownArmy,
        ctx.session.gameInformation.player.alliance + ' *Friendly army*',
        emoji.army,
        true
      )

      const notPowerusers = friends
        .filter(o => poweruserFriendNames.indexOf(o) < 0)
      if (notPowerusers.length > 0) {
        const notPoweruserString = notPowerusers
          .map(o => createPlayerNameString({player: o}, true))
          .join(', ')

        text += '\n'
        text += 'Not powerusers or buildings not up to date:\n'
        text += notPoweruserString
        text += '\n'
      }

      text += '\n'
      const enemyArmyArr = enemyStats
        .filter(o => !o.immune)
        .map(o => o.army.estimate)
      const enemyArmy = getSumAverageAmount(enemyArmyArr)
      text += createAverageSumString(
        enemyArmy,
        enemyStats[0].alliance + ' *Enemy Assumption*',
        emoji.army,
        true
      )
    } else {
      text += '💙😎 When you are poweruser and your buildings are up to date you will get additional information.'
    }
    text += '\n\n'

    const statsStrings = enemyStats.map(o => createPlayerStatsTwoLineString(o, true))
    text += statsStrings.join('\n')

    const buttons = enemyStats.map(o => createPlayerShareButton(o))
    extra = extra.markup(
      Markup.inlineKeyboard(buttons, {columns: 1})
    )
  }

  return ctx.reply(text, extra)
}))

function getRelevantPlayersFromBattle(battle, playerName) {
  if (battle.enemy) {
    return [battle.enemy]
  }

  return battle.attack.indexOf(playerName) < 0 ? battle.attack : battle.defence
}

module.exports = {
  bot
}
