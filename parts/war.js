const Telegraf = require('telegraf')

const {emoji} = require('../lib/user-interface/output-text')

const bot = new Telegraf.Composer()

function isWarMenu(ctx) {
  return ctx.state.screen &&
    ctx.state.screen.type === 'war'
}

bot.on('text', Telegraf.optional(isWarMenu, ctx => {
  let text = 'Updated your domain stats 👍'

  const {domainStats} = ctx.session.gameInformation
  const statsStrings = []
  statsStrings.push(domainStats.wins + emoji.wins)
  statsStrings.push(domainStats.karma + emoji.karma)
  statsStrings.push(domainStats.terra + emoji.terra)
  text += '\n' + statsStrings.join(' ')

  return ctx.replyWithMarkdown(text)
}))

module.exports = {
  bot
}
