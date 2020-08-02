import {Composer} from 'telegraf'

import {PlayerHistory} from '../lib/types/player-history'
import {Context} from '../lib/types'

import {parseAndSave} from '../lib/data/ingame/parse'
import * as playerHistory from '../lib/data/player-history'

import {isForwardedFromBastionSiege} from '../lib/input/bastion-siege-bot'

export const bot = new Composer<Context>()

// Init User session
bot.use(async (ctx, next) => {
  if (!ctx.session.gameInformation) {
    ctx.session.gameInformation = {}
  }

  await next()
})

function forwardedFromClone(ctx: Context): boolean {
  return ctx.message?.forward_from?.id === 741981483
}

bot.on('text', Composer.optional(forwardedFromClone, async ctx => {
  await ctx.reply('🙃')
}))

// Load game screen type and information
bot.on('text', Composer.optional<Context>(isForwardedFromBastionSiege, async (ctx, next) => {
  const {text, forward_date: timestamp} = ctx.message!;
  (ctx as any).state = await parseAndSave(ctx.from!.id, timestamp!, text!)
  await next()
}))

const WANTED_DATA: ReadonlyArray<keyof PlayerHistory> = [
  'buildings',
  'domainStats',
  'effects',
  'player',
  'resources',
  'workshop'
]

// Save some gameInformation to session or ignore when already known
bot.on('text', Composer.optional<Context>(isForwardedFromBastionSiege, async (ctx, next) => {
  const newInformation = ctx.state!.screen!
  const {timestamp} = newInformation

  const dataAvailable = WANTED_DATA
    .filter(o => newInformation[o])
  if (dataAvailable.length === 0) {
    await next()
    return
  }

  const newData = dataAvailable
    .filter(data => ((ctx.session.gameInformation as any)[data + 'Timestamp'] || 0) < timestamp)
  if (newData.length === 0) {
    await ctx.reply(ctx.i18n.t('forward.known'))
    return
  }

  await Promise.all(newData.map(async data => {
    (ctx.session.gameInformation as any)[data + 'Timestamp'] = timestamp
    ctx.session.gameInformation[data] = newInformation[data] as any
    await playerHistory.add(ctx.from!.id, data, timestamp, newInformation[data])
  }))

  await next()
}))
