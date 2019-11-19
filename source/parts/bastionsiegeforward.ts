import {Composer, ContextMessageUpdate} from 'telegraf'
import {Gamescreen} from 'bastion-siege-logic'

import {PlayerHistory} from '../lib/types/player-history'
import {Session} from '../lib/types'

import {parseAndSave} from '../lib/data/ingame/parse'
import * as playerHistory from '../lib/data/player-history'

import {isForwardedFromBastionSiege} from '../lib/input/bastion-siege-bot'

export const bot = new Composer()

// Init User session
bot.use((ctx: any, next) => {
  const session = ctx.session as Session
  if (!session.gameInformation) {
    session.gameInformation = {}
  }

  return next && next()
})

function forwardedFromClone(ctx: ContextMessageUpdate): boolean {
  return Boolean(ctx && ctx.message && ctx.message.forward_from && ctx.message.forward_from.id === 741981483)
}

bot.on('text', Composer.optional(forwardedFromClone, async ctx => {
  return ctx.reply('🙃')
}))

// Load game screen type and information
bot.on('text', Composer.optional(isForwardedFromBastionSiege, async (ctx, next) => {
  const {text, forward_date: timestamp} = ctx.message

  ctx.state = parseAndSave(ctx.from!.id, timestamp, text)

  if (next) {
    await next()
  }
}))

const WANTED_DATA: (keyof PlayerHistory)[] = [
  'attackscout',
  'buildings',
  'domainStats',
  'effects',
  'player',
  'resources',
  'workshop'
]

// Save some gameInformation to session or ignore when already known
bot.on('text', Composer.optional(isForwardedFromBastionSiege, async (ctx: any, next) => {
  const session = ctx.session as Session
  const newInformation = ctx.state.screen as Gamescreen
  const {timestamp} = newInformation

  const dataAvailable = WANTED_DATA
    .filter(o => newInformation[o])
  if (dataAvailable.length === 0) {
    return next && next()
  }

  const newData = dataAvailable
    .filter(data => ((session.gameInformation as any)[data + 'Timestamp'] || 0) < timestamp)
  if (newData.length === 0) {
    return ctx.reply(ctx.i18n.t('forward.known'))
  }

  await Promise.all(newData.map(async data => {
    (session.gameInformation as any)[data + 'Timestamp'] = timestamp
    session.gameInformation[data] = newInformation[data] as any
    await playerHistory.add(ctx.from.id, data, timestamp, newInformation[data])
  }))

  return next && next()
}))
