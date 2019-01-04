const Telegraf = require('telegraf')

const battlereports = require('../lib/data/battlereports')

const playerStats = require('../lib/math/player-stats')

const {createMultiplePlayerStatsStrings} = require('../lib/user-interface/player-stats')
const {emoji} = require('../lib/user-interface/output-text')
const {formatNumberShort} = require('../lib/user-interface/format-number')

const {Extra, Markup} = Telegraf

const bot = new Telegraf.Composer()

function isWarMenu(ctx) {
  return ctx.state.screen &&
    ctx.state.screen.type === 'war'
}

bot.on('text', Telegraf.optional(isWarMenu, ctx => {
  const {domainStats, battle} = ctx.state.screen.information
  let text = '*War*'
  let extra = Extra.markdown()

  const statsStrings = []
  statsStrings.push(formatNumberShort(domainStats.wins, true) + emoji.wins)
  statsStrings.push(formatNumberShort(domainStats.karma, true) + emoji.karma)
  statsStrings.push(formatNumberShort(domainStats.terra, true) + emoji.terra)
  text += '\n' + statsStrings.join(' ')

  if (battle) {
    const allBattlereports = battlereports.getAll()
    text += '\n\n'

    const time = ctx.message.forward_date
    const minutesAgo = ((Date.now() / 1000) - time) / 60
    if (minutesAgo > 8) {
      text += 'This battle is long over… Send me the report instead. 😉'
      return ctx.replyWithMarkdown(text)
    }

    const allPlayersInvolved = []
      .concat(battle.attack || [])
      .concat(battle.defence || [])
    const {name} = ctx.session.gameInformation.player || {}
    if (allPlayersInvolved.length > 0 && (!name || allPlayersInvolved.indexOf(name) < 0)) {
      text += 'I need your name for that. Send me your main screen first. 😅'
      return ctx.replyWithMarkdown(text)
    }

    const playersToShow = getRelevantPlayersFromBattle(battle, name)
    const allStats = playersToShow
      .map(o => playerStats.generate(allBattlereports, o))
    const {buttons, statsStrings} = createMultiplePlayerStatsStrings(allStats)

    text += statsStrings.join('\n\n')
    extra = extra.markup(
      Markup.inlineKeyboard(buttons, {columns: 1})
    )
  }

  return ctx.reply(text, extra)
}))

function getRelevantPlayersFromBattle(battle, playerName) {
  if (battle.enemy) {
    return [battle.enemy]
  }

  return battle.attack.indexOf(playerName) < 0 ? battle.attack : battle.defence
}

module.exports = {
  bot
}
