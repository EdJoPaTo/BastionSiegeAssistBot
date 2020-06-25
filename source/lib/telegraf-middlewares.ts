import {Middleware} from 'telegraf'

import {Context} from './types'
import {isPoweruser} from './data/poweruser'

export function notNewMiddleware(i18nMessage = 'forward.old', maxAgeInMinutes = 8): Middleware<Context> {
  return async (ctx, next) => {
    const fromId = ctx.from!.id
    const time = ctx.message!.forward_date!
    const minutesAgo = ((Date.now() / 1000) - time) / 60
    if (minutesAgo > maxAgeInMinutes && !isPoweruser(fromId)) {
      await ctx.reply(ctx.i18n.t(i18nMessage))
      return
    }

    await next()
  }
}
