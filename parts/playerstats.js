const Telegraf = require('telegraf')

const playerStatsDb = require('../lib/data/playerstats-db')

const {createPlayerShareButton, createPlayerStatsString} = require('../lib/user-interface/player-stats')

const {Extra, Markup} = Telegraf

const bot = new Telegraf.Composer()

function isAttackIncoming(ctx) {
  return ctx.state.screen &&
         ctx.state.screen.information &&
         ctx.state.screen.information.attackincoming
}

bot.on('text', Telegraf.optional(isAttackIncoming, ctx => {
  const {attackincoming} = ctx.state.screen.information
  const time = ctx.message.forward_date
  const minutesAgo = ((Date.now() / 1000) - time) / 60
  if (minutesAgo > 8) {
    let text = ''
    text += ctx.i18n.t('battle.over')
    return ctx.reply(text)
  }

  const {text, extra} = generatePlayerStats(attackincoming.player)
  return ctx.reply(text, extra)
}))

function isAttackScout(ctx) {
  return ctx.state.screen &&
         ctx.state.screen.information &&
         ctx.state.screen.information.attackscout
}

bot.on('text', Telegraf.optional(isAttackScout, ctx => {
  const {attackscout} = ctx.state.screen.information
  const time = ctx.message.forward_date
  const minutesAgo = ((Date.now() / 1000) - time) / 60
  if (minutesAgo > 2) {
    let text = ''
    text += ctx.i18n.t('battle.scoutsGone', {name: attackscout.player})
    return ctx.reply(text)
  }

  const {text, extra} = generatePlayerStats(attackscout.player)
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
