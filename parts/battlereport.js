const Telegraf = require('telegraf')

const battlereports = require('../lib/data/battlereports')

const playerStats = require('../lib/math/player-stats')
const playerStatsSearch = require('../lib/math/player-stats-search')

const {createPlayerStatsString} = require('../lib/user-interface/player-stats')
const {createSingleBattleShortStatsLine} = require('../lib/user-interface/battle-stats')

const {Extra, Markup} = Telegraf

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

async function generateResponseText(ctx, report, timestamp, isNew) {
  let text = '*Battlereport*'
  const baseExtra = Extra
    .markdown()
    .inReplyTo(ctx.message.message_id)

  try {
    if (!report) {
      throw new Error('Could not read report text correctly!')
    }

    const allBattlereports = await battlereports.getAll()
    const {attack, reward, friends, enemies} = report

    if (isNew && timestamp > ctx.session.gameInformation.resourcesTimestamp) {
      ctx.session.gameInformation.resources.gold += reward
    }
    if (attack) {
      const timestampType = (friends.length > 1 || enemies.length > 1) ? 'battleAllianceTimestamp' : 'battleSoloTimestamp'
      ctx.session.gameInformation[timestampType] = Math.max(ctx.session.gameInformation[timestampType] || 0, timestamp)
    }

    const buttons = report.enemies.map(
      o => Markup.switchToChatButton(`Share ${o}…`, o)
    ).map(o => [o])
    const markup = Markup.inlineKeyboard(buttons)

    text += '\n'
    text += createSingleBattleShortStatsLine(report)

    if (isNew) {
      text += '\nThanks for that. I added it 👌'

      if (!ctx.session.search) {
        ctx.session.search = {}
      }
      ctx.session.search.remainingSearches = playerStatsSearch.newSearchLimitAfterReward(ctx.session.search.remainingSearches, 1)
    } else {
      text += '\nYou have sent me this one already 🙃'
    }

    const {name: expectedName} = ctx.session.gameInformation.player || {}
    if (expectedName) {
      const expectedNameIsInFriends = report.friends.indexOf(expectedName) >= 0
      if (!expectedNameIsInFriends) {
        text += '\n❓Have you changed your ingame name? If so, please send me a new main menu screen from @BastionSiegeBot. Then I am up to date again. 😎'
      }
    }

    text += '\n\n'
    text += report.enemies
      .map(o => playerStats.generate(allBattlereports, o))
      .map(o => createPlayerStatsString(o))
      .join('\n\n')

    return {
      extra: baseExtra.markup(markup),
      text
    }
  } catch (error) {
    console.log('Error while showing added report to user:', error)

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
