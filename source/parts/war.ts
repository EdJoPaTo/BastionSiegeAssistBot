import {Composer, Extra, Markup} from 'telegraf'
import {Gamescreen, BattleSolo, BattleAlliance} from 'bastion-siege-logic'

import * as playerStatsDb from '../lib/data/playerstats-db'
import * as poweruser from '../lib/data/poweruser'
import * as wars from '../lib/data/wars'

import {whenScreenIsOfType} from '../lib/input/gamescreen'

import {createPlayerShareButton, createPlayerStatsString} from '../lib/user-interface/player-stats'
import {createWarOneLineString} from '../lib/user-interface/war-stats'
import {emoji} from '../lib/user-interface/output-text'
import {formatNumberShort} from '../lib/user-interface/format-number'

export const bot = new Composer()

bot.on('text', whenScreenIsOfType('war', async (ctx: any) => {
  const screen = ctx.state.screen as Gamescreen
  const {domainStats, battle, timestamp} = screen
  let text = `*${ctx.i18n.t('bs.war')}*\n`
  let extra = Extra.markdown()

  const statsStrings = []
  statsStrings.push(formatNumberShort(domainStats!.wins, true) + emoji.wins)
  statsStrings.push(formatNumberShort(domainStats!.karma, true) + emoji.karma)
  statsStrings.push(formatNumberShort(domainStats!.terra, true) + emoji.terra)
  text += statsStrings.join(' ')
  text += '\n\n'

  if (battle) {
    const now = Date.now() / 1000
    const minutesAgo = (now - timestamp) / 60
    if (minutesAgo > 8) {
      text += ctx.i18n.t('battle.over')
      return ctx.replyWithMarkdown(text)
    }

    if (isBattleSolo(battle)) {
      const stats = playerStatsDb.get(battle.enemy.name)
      text += createPlayerStatsString(stats)
      extra = extra.markup(
        Markup.inlineKeyboard([
          createPlayerShareButton(stats) as any
        ])
      ) as any
    } else {
      text += createWarOneLineString(battle)
      text += '\n'

      await wars.add(timestamp, battle)
      text += ctx.i18n.t('battle.inlineWar.updated')
      text += '\n\n'

      if (!poweruser.isPoweruser(ctx.from.id)) {
        text += emoji.poweruser
        text += ' '
        text += ctx.i18n.t('poweruser.usefulWhen')
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

      text += emoji.poweruser
      text += ' '
      text += ctx.i18n.t('battle.inlineWar.share')

      extra = extra.markup(
        Markup.inlineKeyboard([
          Markup.switchToChatButton('Share War…', 'war') as any
        ])
      ) as any
    }
  }

  return ctx.reply(text, extra)
}))

function isBattleSolo(battle: BattleSolo | BattleAlliance): battle is BattleSolo {
  return Boolean((battle as any).enemy)
}

module.exports = {
  bot
}
