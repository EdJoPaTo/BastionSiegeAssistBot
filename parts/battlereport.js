const Telegraf = require('telegraf')

const battlereports = require('../lib/data/battlereports')
const playerStatsDb = require('../lib/data/playerstats-db')
const {isImmune} = require('../lib/data/poweruser')

const playerStatsSearch = require('../lib/math/player-stats-search')
const {calcSemitotalGold, calcMissingPeople, calcWallRepairCost, calcWallArcherCapacity} = require('../lib/math/siegemath')
const {ONE_DAY_IN_SECONDS} = require('../lib/math/unix-timestamp')

const {createPlayerShareButton, createPlayerStatsString, createTwoSidesStatsString} = require('../lib/user-interface/player-stats')
const {createSingleBattleShortStatsLine} = require('../lib/user-interface/battle-stats')
const {formatNumberShort} = require('../lib/user-interface/format-number')
const {emoji} = require('../lib/user-interface/output-text')

const {Extra, Markup} = Telegraf

const MAX_AGE_BUILDINGS = ONE_DAY_IN_SECONDS // 24h
const MAX_AGE_REPORT_FOR_STATS = ONE_DAY_IN_SECONDS * 2 // 2 days

const bot = new Telegraf.Composer()

function isBattleReport(ctx) {
  return ctx.state.screen &&
    ctx.state.screen.type === 'battlereport'
}

// Save battlereport
bot.on('text', Telegraf.optional(isBattleReport, async ctx => {
  const report = ctx.state.screen.information.battlereport
  const {timestamp} = ctx.state.screen

  const isNew = await battlereports.add(ctx.from.id, timestamp, report, ctx.message.text)

  const {text, extra} = await generateResponseText(ctx, report, timestamp, isNew)

  return ctx.reply(text, extra)
}))

function applyReportToGameInformation(ctx, report, timestamp, isNew) {
  const {
    attack, enemies, friends, gold, soldiersAlive, soldiersTotal, karma, terra, won
  } = report
  const soldiersLost = soldiersTotal - soldiersAlive
  const soldiersLostResult = calcMissingPeople(ctx.session.gameInformation.buildings, soldiersLost)

  if (isNew) {
    if (timestamp > ctx.session.gameInformation.resourcesTimestamp) {
      ctx.session.gameInformation.resources.gold += gold

      if (isFinite(soldiersLostResult.gold)) {
        ctx.session.gameInformation.resources.gold += soldiersLostResult.gold
      }

      if (attack) {
        ctx.session.gameInformation.resources.food -= soldiersTotal // 1 food per send soldier required to start war
      }

      ctx.session.gameInformation.resources.gold = Math.max(ctx.session.gameInformation.resources.gold, 0)
      ctx.session.gameInformation.resources.food = Math.max(ctx.session.gameInformation.resources.food, 0)
    }

    if (timestamp > ctx.session.gameInformation.domainStatsTimestamp) {
      ctx.session.gameInformation.domainStats.karma += karma ? karma : 0
      ctx.session.gameInformation.domainStats.terra += terra ? terra : 0
      ctx.session.gameInformation.domainStats.wins += won ? 1 : 0
    }
  }

  if (attack) {
    const timestampType = (friends.length > 1 || enemies.length > 1) ? 'battleAllianceTimestamp' : 'battleSoloTimestamp'
    ctx.session.gameInformation[timestampType] = Math.max(ctx.session.gameInformation[timestampType] || 0, timestamp)
  }
}

async function generateResponseText(ctx, report, timestamp, isNew) {
  let text = '*Battlereport*'
  const baseExtra = Extra
    .markdown()
    .inReplyTo(ctx.message.message_id)

  try {
    if (!report) {
      throw new Error('Could not read report text correctly!')
    }

    applyReportToGameInformation(ctx, report, timestamp, isNew)

    const friendsStats = report.friends
      .map(o => playerStatsDb.get(o))
    const enemyStats = report.enemies
      .map(o => playerStatsDb.get(o))
    const allianceBattle = friendsStats.length > 1 || enemyStats.length > 1

    const attackerStats = report.attack ? friendsStats : enemyStats
    const defenderStats = report.attack ? enemyStats : friendsStats

    const buttons = [...attackerStats, ...defenderStats]
      .filter(o => !isImmune(o.player))
      .map(o => createPlayerShareButton(o))
    const markup = Markup.inlineKeyboard(buttons, {columns: 2})

    text += '\n'
    text += createSingleBattleShortStatsLine(report)
    text += '\n'

    if ((Date.now() / 1000) - MAX_AGE_BUILDINGS < ctx.session.gameInformation.buildingsTimestamp) {
      const {buildings} = ctx.session.gameInformation

      const {soldiersAlive, soldiersTotal} = report
      const soldiersLost = soldiersTotal - soldiersAlive
      if (soldiersLost > 0) {
        const soldiersLostResult = calcMissingPeople(buildings, soldiersLost)

        text += emoji.people + '→' + emoji.houses + '→' + emoji.barracks
        text += soldiersLostResult.minutesNeeded + ' min'
        text += ': '
        text += formatNumberShort(soldiersLostResult.gold, true) + emoji.gold
        text += '\n'
      }

      if (!report.attack) {
        const wallRepairCost = calcSemitotalGold(calcWallRepairCost(buildings.wall))
        const archerLostResult = calcMissingPeople(buildings, calcWallArcherCapacity(buildings.wall))

        text += emoji.people + '→' + emoji.houses + '→' + emoji.wall
        text += '≤' + archerLostResult.minutesNeeded + ' min'
        text += ': '
        text += '≤' + formatNumberShort(archerLostResult.gold, true) + emoji.gold
        text += '\n'

        text += emoji.wall + emoji.repair
        text += '≤' + formatNumberShort(-wallRepairCost, true) + emoji.gold
        text += '\n'
      }
    }

    if (isNew) {
      text += '\n' + ctx.i18n.t('battlereport.added')

      if (!ctx.session.search) {
        ctx.session.search = {}
      }

      ctx.session.search.remainingSearches = playerStatsSearch.newSearchLimitAfterReward(ctx.session.search.remainingSearches, 1)
    } else {
      text += '\n' + ctx.i18n.t('battlereport.known')
    }

    const {name: expectedName} = ctx.session.gameInformation.player || {}
    if (expectedName) {
      const expectedNameIsInFriends = report.friends.includes(expectedName)
      if (!expectedNameIsInFriends) {
        text += '\n' + ctx.i18n.t('battlereport.changedIngameName')
      }
    }

    if ((Date.now() / 1000) - MAX_AGE_REPORT_FOR_STATS < timestamp) {
      const statsString = allianceBattle ? createTwoSidesStatsString(attackerStats, defenderStats) : createPlayerStatsString(enemyStats[0])
      text += '\n\n' + statsString
    }

    return {
      extra: baseExtra.markup(markup),
      text
    }
  } catch (error) {
    console.log('Error while showing added report to user', ctx.update, error)

    text += '\nSomething seems fishy here but your report has been saved successfully. 🐟'
    text += '\nPlease tell about this in the BastionSiegeAssist Support Group in order to get this fixed. 😇'

    text += '\n'
    text += '\nError: `'
    text += error.message
    text += '`'

    const keyboard = Markup.inlineKeyboard([
      Markup.urlButton('Join BastionSiegeAssist Support Group', 'https://t.me/joinchat/AC0dV1dG2Y7sOFQPtZm9Dw')
    ], {columns: 1})

    return {
      text,
      extra: baseExtra.markup(keyboard)
    }
  }
}

module.exports = {
  bot
}
