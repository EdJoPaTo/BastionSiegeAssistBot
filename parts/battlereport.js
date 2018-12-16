const Telegraf = require('telegraf')

const battlereports = require('../lib/data/battlereports')

const playerStats = require('../lib/math/player-stats')
const playerStatsSearch = require('../lib/math/player-stats-search')

const {createPlayerStatsString} = require('../lib/user-interface/player-stats')
const {createSingleBattleShortStatsLine} = require('../lib/user-interface/battle-stats')

const {Extra, Markup} = Telegraf

const bot = new Telegraf.Composer()

function isBattleReport(ctx) {
  return ctx.state.screen && (
    ctx.state.screen.type === 'battlereport' ||
    ctx.state.screen.type === 'alliance-battlereport'
  )
}

// Save battlereport
bot.on('text', Telegraf.optional(isBattleReport, async ctx => {
  const report = ctx.state.screen.information.battlereport
  const {timestamp} = ctx.state.screen

  const isNew = await battlereports.add(ctx.from.id, timestamp, report, ctx.message.text)

  let text = '*Battlereport*'

  const baseExtra = Extra
    .markdown()
    .inReplyTo(ctx.message.message_id)

  if (!report) {
    text += '\nSomething seems fishy here. 🐟'
    text += '\nPlease tell about this in the BastionSiegeAssist Support Group in order to get this fixed. 😇'
    const keyboard = Markup.inlineKeyboard([
      Markup.urlButton('Join BastionSiegeAssist Support Group', 'https://t.me/BastionSiegeAssist')
    ], {columns: 1})

    return ctx.reply(text, baseExtra.markup(keyboard))
  }

  const allBattlereports = await battlereports.getAll()
  const {attack, reward} = report

  const {resourceTimestamp} = ctx.session.gameInformation
  if (isNew && timestamp > resourceTimestamp) {
    ctx.session.gameInformation.resources.gold += reward
  }
  if (attack) {
    const timestampType = ctx.state.screen.type === 'alliance-battlereport' ? 'battleAllianceTimestamp' : 'battleSoloTimestamp'
    ctx.session.gameInformation[timestampType] = Math.max(ctx.session.gameInformation[timestampType] || 0, timestamp)
  }

  const buttons = [
    [
      Markup.callbackButton('Your Battle Stats', 'battlestats')
    ]
  ]
    .concat(
      report.enemies.map(
        o => Markup.switchToChatButton(`Share ${o}…`, o)
      ).map(o => [o])
    )
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

  return ctx.reply(text, baseExtra.markup(markup))
}))

module.exports = {
  bot
}
