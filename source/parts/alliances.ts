import {Composer} from 'telegraf'

import {sortBy} from '../lib/javascript-abstraction/array'

import {PlayerStats} from '../lib/types'

import * as playerStatsDb from '../lib/data/playerstats-db'
import * as poweruser from '../lib/data/poweruser'

import {getMidnightXDaysEarlier} from '../lib/math/unix-timestamp'

import {createMultipleStatsConclusion} from '../lib/user-interface/player-stats'

export const bot = new Composer()

bot.command('alliances', (ctx: any) => {
  let text = `*${ctx.i18n.t('bs.alliance')}*\n`
  if (!poweruser.isPoweruser(ctx.from.id)) {
    text += ctx.i18n.t('poweruser.usefulWhen')
    return ctx.replyWithMarkdown(text)
  }

  const minDate = getMidnightXDaysEarlier(Date.now() / 1000, 7) // Seen within 7 days

  const playerStats = playerStatsDb.list()
    .filter(o => o.lastBattleTime > minDate)

  const groupedByAlliance = playerStats
    .reduce((coll: Record<string, PlayerStats[]>, add) => {
      const {alliance} = add
      if (!coll[alliance!]) {
        coll[alliance!] = []
      }

      coll[alliance!].push(add)
      return coll
    }, {})

  const entries = Object.keys(groupedByAlliance)
    .map(o => createMultipleStatsConclusion(groupedByAlliance[o]))
    .filter(o => o.army.amount >= 5)
    .sort(sortBy(o => o.army.avg, true))

  text += '\n'
  text += entries
    .map(o => o.armyString)
    .join('\n')

  return ctx.replyWithMarkdown(text)
})
