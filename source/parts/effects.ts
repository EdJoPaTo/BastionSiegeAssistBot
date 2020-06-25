import {Composer} from 'telegraf'

import {Context} from '../lib/types'
import {whenScreenContainsInformation} from '../lib/input/gamescreen'

export const bot = new Composer<Context>()

bot.on('text', whenScreenContainsInformation('effects', async ctx => {
  await ctx.reply(ctx.i18n.t('effects.updated'))
}))
