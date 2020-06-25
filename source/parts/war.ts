import {BattleSolo, BattleAlliance} from 'bastion-siege-logic'
import {Composer, Extra, Markup, Telegram} from 'telegraf'
import {ExtraReplyMessage} from 'telegraf/typings/telegram-types'
import {InlineKeyboardButton} from 'telegraf/typings/markup'

import {Context, War, WarNotificationMessage} from '../lib/types'

import * as playerStatsDb from '../lib/data/playerstats-db'
import * as poweruser from '../lib/data/poweruser'
import * as userSessions from '../lib/data/user-sessions'
import * as wars from '../lib/data/wars'

import {whenScreenIsOfType} from '../lib/input/gamescreen'

import {createPlayerShareButton, createPlayerStatsString} from '../lib/user-interface/player-stats'
import {createWarOneLineString} from '../lib/user-interface/war-stats'
import {emoji} from '../lib/user-interface/output-text'
import {formatNumberShort} from '../lib/user-interface/format-number'

export const bot = new Composer<Context>()

bot.on('text', whenScreenIsOfType('war', async ctx => {
  const {timeZone, gameInformation} = ctx.session
  const {domainStats, battle, timestamp} = ctx.state.screen
  let text = `*${ctx.i18n.t('bs.war')}*\n`
  const extra: ExtraReplyMessage = {parse_mode: 'Markdown'}

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
      await ctx.replyWithMarkdown(text)
      return
    }

    if (isBattleSolo(battle)) {
      const stats = playerStatsDb.get(battle.enemy.name)
      text += createPlayerStatsString(stats, timeZone || 'UTC')
      extra.reply_markup = Markup.inlineKeyboard([
        createPlayerShareButton(stats)
      ])
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
        await ctx.replyWithMarkdown(text)
        return
      }

      const allPlayersInvolved = new Set([
        ...battle.attack,
        ...battle.defence
      ])
      const user = gameInformation.player
      if (!user || !allPlayersInvolved.has(user.name)) {
        text += ctx.i18n.t('name.need')
        await ctx.replyWithMarkdown(text)
        return
      }

      text += emoji.poweruser
      text += ' '
      text += ctx.i18n.t('battle.inlineWar.share')

      const buttons: InlineKeyboardButton[][] = []

      if (user.alliance) {
        buttons.push([
          Markup.callbackButton('Notify alliance ' + user.alliance, 'war-notify-alliance')
        ])
      }

      buttons.push([
        Markup.switchToChatButton('Share War…', 'war')
      ])

      extra.reply_markup = Markup.inlineKeyboard(buttons)
    }
  }

  await ctx.reply(text, extra)
}))

function isBattleSolo(battle: BattleSolo | BattleAlliance): battle is BattleSolo {
  return 'enemy' in battle
}

bot.action('war-notify-alliance', async ctx => {
  const now = Date.now() / 1000
  const {player} = ctx.session.gameInformation

  if (!player || !player.alliance) {
    await ctx.answerCbQuery(ctx.i18n.t('name.need'))
    return
  }

  const currentWar = wars.getCurrent(now, player.name)
  if (!currentWar) {
    throw new Error('there is no war?')
  }

  const lastSentMessageTimestamp = Math.max(...currentWar.notificationMessages.map(o => o.timestamp))
  if (lastSentMessageTimestamp + 60 > now) {
    // Already sent a notification within 60 seconds.
    await ctx.answerCbQuery('Dont spam your alliance mates!')
    return
  }

  const allParticipants = new Set([...currentWar.battle.attack, ...currentWar.battle.defence])
  const missingMates = userSessions.getRawInAlliance(player.alliance)
    .filter(o => !allParticipants.has(o.data.gameInformation.player!.name))

  const allNotificationAttempts = await Promise.all(
    missingMates.map(async o => notifyPlayer(ctx.telegram, o.data.gameInformation.player!.name, o.user, currentWar))
  )
  const allNotifications = allNotificationAttempts
    .filter((o): o is WarNotificationMessage => Boolean(o))

  await wars.addNotificationMessages(now, {name: player.name, alliance: player.alliance}, ...allNotifications)
  await ctx.answerCbQuery('all notified 😎')
})

async function notifyPlayer(telegram: Telegram, playerName: string, playerId: number, war: War): Promise<WarNotificationMessage | undefined> {
  try {
    let text = ''
    text += emoji.alertEnabled
    text += emoji.war
    text += ' '
    text += createWarOneLineString(war.battle)

    const keyboard = Markup.inlineKeyboard([
      Markup.urlButton(emoji.backTo + 'Open BastionSiege…', 'https://t.me/BastionSiegeBot')
    ])

    const notificationMessage = await telegram.sendMessage(playerId, text, Extra.markup(keyboard))

    return {
      timestamp: notificationMessage.date,
      chatId: playerId,
      player: playerName,
      messageId: notificationMessage.message_id
    }
  } catch (error) {
    console.error('failed to send war notification', error.message)
    return undefined
  }
}
