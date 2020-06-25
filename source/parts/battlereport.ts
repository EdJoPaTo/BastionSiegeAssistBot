import {calcSemitotalGold, calcRecoveryMissingPeople, calcWallRepairCost, calcWallArcherCapacity, BattlereportRaw} from 'bastion-siege-logic'
import {Composer, Extra, Markup} from 'telegraf'
import {ExtraReplyMessage} from 'telegraf/typings/telegram-types'

import {Context} from '../lib/types'

import * as playerStatsDb from '../lib/data/playerstats-db'
import {isImmune, getReportsTodayAmount} from '../lib/data/poweruser'

import {ONE_DAY_IN_SECONDS} from '../lib/math/unix-timestamp'

import {whenScreenContainsInformation} from '../lib/input/gamescreen'

import {createPlayerShareButton, createPlayerStatsString, createTwoSidesStatsString} from '../lib/user-interface/player-stats'
import {createSingleBattleShortStatsLine, createSingleAllianceBattleShortStatsLine} from '../lib/user-interface/battle-stats'
import {emoji} from '../lib/user-interface/output-text'
import {formatNumberShort} from '../lib/user-interface/format-number'
import {getSupportGroupLink} from '../lib/user-interface/support-group'

const MAX_AGE_BUILDINGS = ONE_DAY_IN_SECONDS // 24h
const MAX_AGE_REPORT_FOR_STATS = ONE_DAY_IN_SECONDS * 2 // 2 days

export const bot = new Composer<Context>()

bot.on('text', whenScreenContainsInformation('battlereport', async ctx => {
  const report = ctx.state.screen.battlereport!
  const {timestamp} = ctx.state.screen
  const isNew = Boolean(ctx.state.isNewBattlereport)

  const {text, extra} = await generateResponseText(ctx, report, timestamp, isNew)

  await ctx.reply(text, extra)
}))

function applyReportToGameInformation(ctx: Context, report: BattlereportRaw, timestamp: number, isNew: boolean): void {
  const {
    attack, enemies, friends, gold, soldiersAlive, soldiersTotal, karma, terra, won
  } = report
  const soldiersLost = soldiersTotal - soldiersAlive
  const soldiersLostResult = calcRecoveryMissingPeople(ctx.session.gameInformation.buildings! || {}, soldiersLost)

  if (isNew) {
    if (ctx.session.gameInformation.resources && timestamp > ctx.session.gameInformation.resourcesTimestamp!) {
      let newGold = ctx.session.gameInformation.resources.gold
      let newFood = ctx.session.gameInformation.resources.food
      newGold += gold

      if (Number.isFinite(soldiersLostResult.gold)) {
        newGold += soldiersLostResult.gold
      }

      if (attack) {
        newFood -= soldiersTotal // 1 food per send soldier required to start war
      }

      ctx.session.gameInformation.resources = {
        ...ctx.session.gameInformation.resources,
        gold: Math.max(newGold, 0),
        food: Math.max(newFood, 0)
      }
    }

    if (ctx.session.gameInformation.domainStats && timestamp > ctx.session.gameInformation.domainStatsTimestamp!) {
      ctx.session.gameInformation.domainStats = {
        karma: ctx.session.gameInformation.domainStats.karma + (karma ?? 0),
        terra: ctx.session.gameInformation.domainStats.terra + (terra ?? 0),
        wins: ctx.session.gameInformation.domainStats.wins + (won ? 1 : 0)
      }
    }
  }

  if (attack) {
    const timestampType = (friends.length > 1 || enemies.length > 1) ? 'battleAllianceTimestamp' : 'battleSoloTimestamp'
    ctx.session.gameInformation[timestampType] = Math.max(ctx.session.gameInformation[timestampType] || 0, timestamp)
  }
}

async function generateResponseText(ctx: Context, report: BattlereportRaw, timestamp: number, isNew: boolean): Promise<{text: string; extra: ExtraReplyMessage}> {
  const now = Date.now() / 1000
  const {buildings} = ctx.session.gameInformation

  let text = '*Battlereport*'
  const baseExtra = Extra
    .markdown()
    .inReplyTo(ctx.message!.message_id)

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

    if (report.friends.length > 1 && report.won) {
      text += createSingleAllianceBattleShortStatsLine(report)
      text += '\n\n'
    }

    const expectedPlayer = ctx.session.gameInformation.player
    const expectedName = expectedPlayer?.name

    if (buildings && now - MAX_AGE_BUILDINGS < ctx.session.gameInformation.buildingsTimestamp!) {
      const {soldiersAlive, soldiersTotal} = report
      const soldiersLost = soldiersTotal - soldiersAlive
      if (soldiersLost > 0) {
        const soldiersLostResult = calcRecoveryMissingPeople(buildings, soldiersLost)

        text += emoji.people + '→' + emoji.houses + '→' + emoji.barracks
        text += soldiersLostResult.minutesNeeded
        text += ' min'
        text += ': '
        text += formatNumberShort(soldiersLostResult.gold, true) + emoji.gold
        text += '\n'
      }

      if (!report.attack && report.friends[0] === expectedName) {
        const wallRepairCost = calcSemitotalGold(calcWallRepairCost(buildings.wall))
        const archerLostResult = calcRecoveryMissingPeople(buildings, calcWallArcherCapacity(buildings.wall))

        text += emoji.people + '→' + emoji.houses + '→' + emoji.wall
        text += '≤'
        text += archerLostResult.minutesNeeded
        text += ' min'
        text += ': '
        text += '≤' + formatNumberShort(archerLostResult.gold, true) + emoji.gold
        text += '\n'

        text += emoji.wall + emoji.repair
        text += '≤' + formatNumberShort(-wallRepairCost, true) + emoji.gold
        text += '\n'
      }
    }

    if (isNew) {
      text += '\n'
      text += ctx.i18n.t('battlereport.added')
    } else {
      text += '\n'
      text += ctx.i18n.t('battlereport.known')
    }

    text += '\n'
    const reportsToday = getReportsTodayAmount(ctx.from!.id)
    const requiredReports = 10
    text += `📅 ${reportsToday} / ${requiredReports}${emoji.battlereport}`

    if (expectedName) {
      const expectedNameIsInFriends = report.friends.includes(expectedName)
      if (!expectedNameIsInFriends) {
        text += '\n'
        text += ctx.i18n.t('battlereport.changedIngameName')
      }
    }

    if ((Date.now() / 1000) - MAX_AGE_REPORT_FOR_STATS < timestamp) {
      const statsString = allianceBattle ? createTwoSidesStatsString(attackerStats, defenderStats, {}, {}) : createPlayerStatsString(enemyStats[0], ctx.session.timeZone || 'UTC')
      text += '\n\n' + statsString
    }

    return {
      extra: baseExtra.markup(markup),
      text
    }
  } catch (error) {
    console.error('Error while showing added report to user', ctx.update, error)

    text += '\nSomething seems fishy here but your report has been saved successfully. 🐟'
    text += '\nPlease tell about this in the BastionSiegeAssist Support Group in order to get this fixed. 😇'

    text += '\n'
    text += '\nError: `'
    text += error.message
    text += '`'

    const keyboard = Markup.inlineKeyboard([
      Markup.urlButton('Join BastionSiegeAssist Support Group', getSupportGroupLink(ctx.i18n.locale()))
    ], {columns: 1})

    return {
      text,
      extra: baseExtra.markup(keyboard)
    }
  }
}
