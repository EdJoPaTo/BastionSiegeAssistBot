import {Composer, Extra, Markup} from 'telegraf'
import {calcSemitotalGold, calcRecoveryMissingPeople, calcWallRepairCost, calcWallArcherCapacity, Battlereport} from 'bastion-siege-logic'

import {Session} from '../lib/types'

import * as playerStatsDb from '../lib/data/playerstats-db'
import {isImmune, getReportsTodayAmount} from '../lib/data/poweruser'

import {ONE_DAY_IN_SECONDS} from '../lib/math/unix-timestamp'

import {whenScreenContainsInformation} from '../lib/input/gamescreen'

import {createPlayerShareButton, createPlayerStatsString, createTwoSidesStatsString} from '../lib/user-interface/player-stats'
import {createSingleBattleShortStatsLine, createSingleAllianceBattleShortStatsLine} from '../lib/user-interface/battle-stats'
import {formatNumberShort} from '../lib/user-interface/format-number'
import {emoji} from '../lib/user-interface/output-text'

const MAX_AGE_BUILDINGS = ONE_DAY_IN_SECONDS // 24h
const MAX_AGE_REPORT_FOR_STATS = ONE_DAY_IN_SECONDS * 2 // 2 days

export const bot = new Composer()

bot.on('text', whenScreenContainsInformation('battlereport', async (ctx: any) => {
  const report = ctx.state.screen.battlereport as Battlereport
  const {timestamp} = ctx.state.screen
  const isNew = ctx.state.isNewBattlereport

  const {text, extra} = await generateResponseText(ctx, report, timestamp, isNew)

  return ctx.reply(text, extra)
}))

function applyReportToGameInformation(ctx: any, report: Battlereport, timestamp: number, isNew: boolean): void {
  const session = ctx.session as Session
  const {
    attack, enemies, friends, gold, soldiersAlive, soldiersTotal, karma, terra, won
  } = report
  const soldiersLost = soldiersTotal - soldiersAlive
  const soldiersLostResult = calcRecoveryMissingPeople(session.gameInformation.buildings! || {}, soldiersLost)

  if (isNew) {
    if (session.gameInformation.resources && session.gameInformation.resourcesTimestamp && timestamp > session.gameInformation.resourcesTimestamp) {
      session.gameInformation.resources.gold += gold

      if (isFinite(soldiersLostResult.gold)) {
        session.gameInformation.resources.gold += soldiersLostResult.gold
      }

      if (attack) {
        session.gameInformation.resources.food -= soldiersTotal // 1 food per send soldier required to start war
      }

      session.gameInformation.resources.gold = Math.max(session.gameInformation.resources.gold, 0)
      session.gameInformation.resources.food = Math.max(session.gameInformation.resources.food, 0)
    }

    if (session.gameInformation.domainStats && session.gameInformation.domainStatsTimestamp && timestamp > session.gameInformation.domainStatsTimestamp) {
      session.gameInformation.domainStats.karma += karma ? karma : 0
      session.gameInformation.domainStats.terra += terra ? terra : 0
      session.gameInformation.domainStats.wins += won ? 1 : 0
    }
  }

  if (attack) {
    const timestampType = (friends.length > 1 || enemies.length > 1) ? 'battleAllianceTimestamp' : 'battleSoloTimestamp'
    session.gameInformation[timestampType] = Math.max(session.gameInformation[timestampType] || 0, timestamp)
  }
}

async function generateResponseText(ctx: any, report: Battlereport, timestamp: number, isNew: boolean): Promise<{text: string; extra: any}> {
  const session = ctx.session as Session
  const {buildings} = session.gameInformation

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
    const markup = Markup.inlineKeyboard(buttons as any[], {columns: 2})

    text += '\n'
    text += createSingleBattleShortStatsLine(report)
    text += '\n'

    if (report.friends.length > 1 && report.won) {
      text += createSingleAllianceBattleShortStatsLine(report)
      text += '\n\n'
    }

    const expectedPlayer = session.gameInformation.player
    const expectedName = expectedPlayer && expectedPlayer.name

    if (session.gameInformation.buildingsTimestamp && buildings && (Date.now() / 1000) - MAX_AGE_BUILDINGS < session.gameInformation.buildingsTimestamp) {
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
    const reportsToday = getReportsTodayAmount(ctx.from.id)
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
      const statsString = allianceBattle ? createTwoSidesStatsString(attackerStats, defenderStats, {}, {}) : createPlayerStatsString(enemyStats[0], session.timeZone || 'UTC')
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
      Markup.urlButton('Join BastionSiegeAssist Support Group', 'https://t.me/joinchat/AC0dV1dG2Y7sOFQPtZm9Dw')
    ], {columns: 1})

    return {
      text,
      extra: baseExtra.markup(keyboard)
    }
  }
}
