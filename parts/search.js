const Telegraf = require('telegraf')

const playerStatsSearch = require('../lib/player-stats-search')

const {Extra, Markup} = Telegraf

const bot = new Telegraf.Composer()

bot.command('search', ctx => {
  const {remainingSearches} = ctx.session.search || {}

  let text = '🔎 *Search*'

  text += '\nRemaining searches: '
  text += Number(remainingSearches || playerStatsSearch.FREE_SEARCHES)
  text += ` times with ${playerStatsSearch.MAX_SECONDS_FOR_ONE_SEARCH}s each`

  text += '\n'
  text += '\nYou can search for player stats with multiple methods:'

  text += '\n'
  text += '\n• Using the *inline search*: Type in any chat `@BastionSiegeAssistBot <text>` to search for a player.'
  text += '\n• Forward the *Your scouts found* message from Bastion Siege to me.'
  text += '\n• Forward the *Your domain attacked* message to me'

  text += '\n'
  text += '\n*Remaining Searches explained*'
  text += '\nWhen you provide reports you get Searches you can use.'
  text += ' When you are more active you get more Searches per provided Report.'

  text += '\n'
  text += '\nAs you search for someone you begin a search window.'
  text += ` For ${playerStatsSearch.MAX_SECONDS_FOR_ONE_SEARCH} Seconds you can search as often as you want.`
  text += ' This is useful when searching for a target.'

  text += '\n'
  text += '\nDo you have feedback or questions to this system? Join @BastionSiegeAssist and share. 😊'

  const keyboard = Markup.inlineKeyboard([
    Markup.switchToCurrentChatButton('try player search…', 'Dragon')
  ])
  return ctx.replyWithMarkdown(text, Extra.markup(keyboard))
})

module.exports = {
  bot
}
