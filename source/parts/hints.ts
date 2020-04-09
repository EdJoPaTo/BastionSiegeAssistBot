import {Composer} from 'telegraf'

import {Session} from '../lib/types'

import * as poweruser from '../lib/data/poweruser'

import {emoji} from '../lib/user-interface/output-text'
import {getHintStrings} from '../lib/user-interface/poweruser'

const POWERUSER_HINT_PREFIX = emoji.poweruser
const HINTS_MAX_INTERVAL = 60 * 30 // 30 Minutes

export const bot = new Composer()

bot.on('text', async (ctx, next) => {
  const session = (ctx as any).session as Session
  const now = Date.now() / 1000
  if (session.lastHintTimestamp! + HINTS_MAX_INTERVAL > now) {
    await next?.()
    return
  }

  let poweruserHints: string[] = []
  if (poweruser.hasSendEnoughReports(ctx.from!.id)) {
    const conditions = poweruser.getConditions(ctx.from!.id)
    poweruserHints = getHintStrings(ctx, conditions)
  }

  const hints = [
    ...poweruserHints.map(o => POWERUSER_HINT_PREFIX + o)
  ]
  if (hints.length > 0) {
    session.lastHintTimestamp = now
    await ctx.replyWithMarkdown(hints.join('\n\n'))
  }

  await next?.()
})
