const Telegraf = require('telegraf')

const playerStatsDb = require('../lib/data/playerstats-db')
const poweruser = require('../lib/data/poweruser')
const wars = require('../lib/data/wars')

const {createPlayerShareButton, createPlayerStatsString} = require('../lib/user-interface/player-stats')
const {createWarOneLineString} = require('../lib/user-interface/war-stats')
const {emoji} = require('../lib/user-interface/output-text')
const {formatNumberShort} = require('../lib/user-interface/format-number')

const {Extra, Markup} = Telegraf

const bot = new Telegraf.Composer()

function isWarMenu(ctx) {
  return ctx.state.screen &&
    ctx.state.screen.type === 'war'
}

bot.on('text', Telegraf.optional(isWarMenu, async ctx => {
  const {domainStats, battle} = ctx.state.screen.information
  let text = `*${ctx.i18n.t('bs.war')}*\n`
  let extra = Extra.markdown()

  const statsStrings = []
  statsStrings.push(formatNumberShort(domainStats.wins, true) + emoji.wins)
  statsStrings.push(formatNumberShort(domainStats.karma, true) + emoji.karma)
  statsStrings.push(formatNumberShort(domainStats.terra, true) + emoji.terra)
  if (!battle) {
    text += statsStrings.join(' ')
  }

  if (battle) {
    const time = ctx.message.forward_date
    const now = Date.now() / 1000
    const minutesAgo = (now - time) / 60
    if (minutesAgo > 8) {
      text += ctx.i18n.t('battle.over')
      return ctx.replyWithMarkdown(text)
    }

    if (battle.enemy) {
      const stats = playerStatsDb.get(battle.enemy)
      text += '\n'
      text += createPlayerStatsString(stats)
      extra = extra.markup(
        Markup.inlineKeyboard([
          createPlayerShareButton(stats)
        ])
      )
    } else {
      text += createWarOneLineString(battle)
      text += '\n\n'

      await wars.add(time, battle)
      text += ctx.i18n.t('battle.inlineWar.updated') + '\n'

      if (!poweruser.isPoweruser(ctx.from.id)) {
        text += emoji.poweruser + ' ' + ctx.i18n.t('poweruser.usefulWhen')
        return ctx.replyWithMarkdown(text)
      }

      const allPlayersInvolved = [
        ...battle.attack,
        ...battle.defence
      ]
      const user = ctx.session.gameInformation.player || {}
      if (!user.name || !allPlayersInvolved.includes(user.name)) {
        text += ctx.i18n.t('name.need')
        return ctx.replyWithMarkdown(text)
      }

      text += emoji.poweruser + ' ' + ctx.i18n.t('battle.inlineWar.share')

      extra = extra.markup(
        Markup.inlineKeyboard([
          Markup.switchToChatButton('Share War…', '')
        ])
      )
    }
  }

  return ctx.reply(text, extra)
}))

module.exports = {
  bot
}
