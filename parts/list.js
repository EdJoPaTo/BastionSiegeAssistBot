const Telegraf = require('telegraf')

const {getMidnightXDaysEarlier} = require('../lib/math/unix-timestamp')

const lists = require('../lib/data/inline-lists')
const poweruser = require('../lib/data/poweruser')

const {createList} = require('../lib/user-interface/inline-list')

const {Extra} = Telegraf

const bot = new Telegraf.Composer()

bot.action(/inlineList:(\d+):([^:]+):.+/, async (ctx, next) => {
  try {
    const now = Date.now() / 1000
    const creatorId = Number(ctx.match[1])
    const listId = ctx.match[2]

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

bot.action(/inlineList:(\d+):([^:]+):join:(.*)/, ctx => {
  const creatorId = Number(ctx.match[1])
  const listId = ctx.match[2]

  const now = Date.now() / 1000
  const {buildingsTimestamp, playerTimestamp} = ctx.session.gameInformation

  if (!playerTimestamp || playerTimestamp < getMidnightXDaysEarlier(now, poweruser.MAX_PLAYER_AGE_DAYS)) {
    const text = ctx.i18n.t('name.need')
    return ctx.answerCbQuery(text, true)
  }

  if (!buildingsTimestamp || buildingsTimestamp < getMidnightXDaysEarlier(now, poweruser.MAX_BUILDING_AGE_DAYS)) {
    const text = ctx.i18n.t('buildings.need.buildings')
    return ctx.answerCbQuery(text, true)
  }

  lists.join(creatorId, listId, Date.now() / 1000, ctx.from.id, {})
})

bot.action(/inlineList:(\d+):([^:]+):leave/, ctx => {
  const creatorId = Number(ctx.match[1])
  const listId = ctx.match[2]
  lists.leave(creatorId, listId, Date.now() / 1000, ctx.from.id)
})

module.exports = {
  bot
}
