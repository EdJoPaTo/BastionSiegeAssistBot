import {Context as TelegrafContext, Middleware} from 'telegraf'

import {isPoweruser} from './data/poweruser'

export function notNewMiddleware(i18nMessage = 'forward.old', maxAgeInMinutes = 8): Middleware<TelegrafContext> {
  return async (ctx, next) => {
    const fromId = ctx.from!.id
    const time = ctx.message!.forward_date!
    const minutesAgo = ((Date.now() / 1000) - time) / 60
    if (minutesAgo > maxAgeInMinutes && !isPoweruser(fromId)) {
      await ctx.reply((ctx as any).i18n.t(i18nMessage))
      return
    }

    await next?.()
  }
}
