const Telegraf = require('telegraf')

const playerStatsDb = require('../lib/data/playerstats-db')

const {createPlayerShareButton, createPlayerStatsString} = require('../lib/user-interface/player-stats')

const {Extra, Markup} = Telegraf

const bot = new Telegraf.Composer()

function screenContainsInformation(name) {
  return ctx => ctx.state.screen &&
    ctx.state.screen.information &&
    ctx.state.screen.information[name]
}

function notNewMiddleware(i18nMessage = 'forward.notnew', maxAgeInMinutes = 8) {
  return (ctx, next) => {
    const time = ctx.message.forward_date
    const minutesAgo = ((Date.now() / 1000) - time) / 60
    if (minutesAgo > maxAgeInMinutes) {
      return ctx.reply(ctx.i18n.t(i18nMessage))
    }

    return next()
  }
}

bot.on('text', Telegraf.optional(screenContainsInformation('attackincoming'), notNewMiddleware('battle.over'), ctx => {
  const {attackincoming} = ctx.state.screen.information
  const {text, extra} = generatePlayerStats(attackincoming.player)
  return ctx.reply(text, extra)
}))

bot.on('text', Telegraf.optional(screenContainsInformation('attackscout'), notNewMiddleware('scouts.gone', 2), ctx => {
  const {attackscout} = ctx.state.screen.information
  const {text, extra} = generatePlayerStats(attackscout.player)
  return ctx.reply(text, extra)
}))

bot.on('text', Telegraf.optional(screenContainsInformation('alliancejoinrequest'), notNewMiddleware(), ctx => {
  const {alliancejoinrequest} = ctx.state.screen.information
  const {text, extra} = generatePlayerStats(alliancejoinrequest.player)
  return ctx.reply(text, extra)
}))

function generatePlayerStats(players) {
  if (!Array.isArray(players)) {
    players = [players]
  }

  const allStats = players
    .map(o => playerStatsDb.get(o))
  const buttons = allStats.map(o => createPlayerShareButton(o))
  const statsStrings = allStats.map(o => createPlayerStatsString(o))

  const text = statsStrings.join('\n\n')
  return {
    text,
    extra: Extra.markdown().markup(Markup.inlineKeyboard(buttons))
  }
}

module.exports = {
  bot
}
