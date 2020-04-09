import {Composer} from 'telegraf'
import arrayReduceGroupBy from 'array-reduce-group-by'

import {sortBy} from '../lib/javascript-abstraction/array'

import {PlayerStats} from '../lib/types'

import * as playerStatsDb from '../lib/data/playerstats-db'
import * as poweruser from '../lib/data/poweruser'

import {filterMaxDays} from '../lib/math/unix-timestamp'

import {createMultipleStatsConclusion} from '../lib/user-interface/player-stats'

export const bot = new Composer()

bot.command('alliances', async (ctx: any) => {
  let text = `*${ctx.i18n.t('bs.alliance')}*\n`
  if (!poweruser.isPoweruser(ctx.from.id)) {
    text += ctx.i18n.t('poweruser.usefulWhen')
    await ctx.replyWithMarkdown(text)
    return
  }

  const playerStats = playerStatsDb.list()
    .filter(filterMaxDays(7, o => o.lastBattleTime))

  const groupedByAlliance = playerStats
    .reduce(arrayReduceGroupBy<string, PlayerStats>(o => o.alliance!), {})

  const entries = Object.keys(groupedByAlliance)
    .map(o => createMultipleStatsConclusion(groupedByAlliance[o]))
    .filter(o => o.army.amount >= 5)
    .sort(sortBy(o => o.army.avg, true))

  text += '\n'
  text += entries
    .map(o => o.armyString)
    .join('\n')

  await ctx.replyWithMarkdown(text)
})
