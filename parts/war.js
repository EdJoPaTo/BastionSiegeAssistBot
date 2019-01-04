const Telegraf = require('telegraf')

const {emoji} = require('../lib/user-interface/output-text')
const {formatNumberShort} = require('../lib/user-interface/format-number')

const bot = new Telegraf.Composer()

function isWarMenu(ctx) {
  return ctx.state.screen &&
    ctx.state.screen.type === 'war'
}

bot.on('text', Telegraf.optional(isWarMenu, ctx => {
  let text = 'Updated your domain stats 👍'

  const {domainStats} = ctx.session.gameInformation
  const statsStrings = []
  statsStrings.push(formatNumberShort(domainStats.wins, true) + emoji.wins)
  statsStrings.push(formatNumberShort(domainStats.karma, true) + emoji.karma)
  statsStrings.push(formatNumberShort(domainStats.terra, true) + emoji.terra)
  text += '\n' + statsStrings.join(' ')

  return ctx.replyWithMarkdown(text)
}))

module.exports = {
  bot
}
