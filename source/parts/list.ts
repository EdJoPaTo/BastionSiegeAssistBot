import {Composer, Extra} from 'telegraf'

import {Context} from '../lib/types'

import {getMidnightXDaysEarlier} from '../lib/math/unix-timestamp'

import * as lists from '../lib/data/inline-lists'
import * as poweruser from '../lib/data/poweruser'

import {createList} from '../lib/user-interface/inline-list'
import {emoji} from '../lib/user-interface/output-text'

export const bot = new Composer<Context>()

bot.action(/inlineList:(\d+):([^:]+):.+/, async (ctx, next) => {
  try {
    const now = Date.now() / 1000
    const creatorId = Number(ctx.match![1])
    const listId = ctx.match![2]

    await next()

    const {text, keyboard} = createList(creatorId, listId, now)
    await ctx.answerCbQuery()
    await ctx.editMessageText(text, Extra.markdown().markup(keyboard))
  } catch (error) {
    if (error.message.startsWith('400: Bad Request: message is not modified')) {
      return
    }

    throw error
  }
})

bot.action(/inlineList:(\d+):([^:]+):join:(.*)/, async ctx => {
  const creatorId = Number(ctx.match![1])
  const listId = ctx.match![2]

  const now = Date.now() / 1000
  const {buildingsTimestamp, playerTimestamp} = ctx.session.gameInformation

  let text = emoji.warning

  if (!playerTimestamp || playerTimestamp < getMidnightXDaysEarlier(now, poweruser.MAX_PLAYER_AGE_DAYS)) {
    text += ctx.i18n.t('name.need')
    await ctx.answerCbQuery(text)
  } else if (!buildingsTimestamp || buildingsTimestamp < getMidnightXDaysEarlier(now, poweruser.MAX_BUILDING_AGE_DAYS)) {
    text += ctx.i18n.t('buildings.need.buildings')
    await ctx.answerCbQuery(text)
  }

  await lists.join(creatorId, listId, Date.now() / 1000, ctx.from!.id, {})
})

bot.action(/inlineList:(\d+):([^:]+):leave/, async ctx => {
  const creatorId = Number(ctx.match![1])
  const listId = ctx.match![2]
  await lists.leave(creatorId, listId, Date.now() / 1000, ctx.from!.id)
})
