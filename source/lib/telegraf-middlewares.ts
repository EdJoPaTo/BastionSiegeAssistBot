import {ContextMessageUpdate, Middleware} from 'telegraf'

export function notNewMiddleware(i18nMessage = 'forward.old', maxAgeInMinutes = 8): Middleware<ContextMessageUpdate> {
  return (ctx, next) => {
    const time = ctx.message!.forward_date!
    const minutesAgo = ((Date.now() / 1000) - time) / 60
    if (minutesAgo > maxAgeInMinutes) {
      return ctx.reply((ctx as any).i18n.t(i18nMessage))
    }

    return next && next()
  }
}
