import {Composer} from 'telegraf'

import {whenScreenContainsInformation} from '../lib/input/gamescreen'

export const bot = new Composer()

bot.on('text', whenScreenContainsInformation('effects', (ctx: any) => {
  return ctx.reply(ctx.i18n.t('effects.updated'))
}))
