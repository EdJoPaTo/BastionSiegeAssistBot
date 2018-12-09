const Telegraf = require('telegraf')

const {Extra, Markup} = Telegraf

const bot = new Telegraf.Composer()

bot.command('search', ctx => {
  const {remainingSearches} = ctx.session.search || {}

  let text = '🔎 *Search*'

  text += '\nRemaining searches: '
  text += Number(remainingSearches)

  text += '\n'
  text += '\nYou can search for player stats with multiple methods:'
  text += '\n• Using the *inline search*: Type in any chat `@BastionSiegeAssistBot <text>` to search for a player.'
  text += '\n• Forward the *Your scouts found* message from Bastion Siege to me.'
  text += '\n• Forward the *Your domain attacked* message to me'

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
