const Telegraf = require('telegraf')

const {sortBy} = require('../lib/javascript-abstraction/array')

const inlineList = require('../lib/data/inline-list')
const playerStatsDb = require('../lib/data/playerstats-db')
const poweruser = require('../lib/data/poweruser')
const wars = require('../lib/data/wars')

const {mystics} = require('../lib/input/game-text')

const {getMidnightXDaysEarlier} = require('../lib/math/unix-timestamp')

const {createPlayerNameString, createPlayerStatsString, createPlayerStatsShortString} = require('../lib/user-interface/player-stats')
const {createWarOneLineString, createWarStats} = require('../lib/user-interface/war-stats')
const {emoji} = require('../lib/user-interface/output-text')
const {createList} = require('../lib/user-interface/inline-list')

const {Extra, Markup} = Telegraf

const bot = new Telegraf.Composer()

bot.on('inline_query', async ctx => {
  const {query} = ctx.inlineQuery
  const queryTestFunc = getTestFunctionForQuery(query)
  const offset = ctx.inlineQuery.offset || 0
  const now = Date.now() / 1000
  const isPoweruser = poweruser.isPoweruser(ctx.from.id)

  const statics = []
  const user = ctx.session.gameInformation.player
  if (isPoweruser) {
    const {timestamp, battle} = wars.getCurrent(now, user.name) || {}
    if (timestamp && battle) {
      statics.push({
        type: 'article',
        id: 'war',
        title: emoji.poweruser + ' ' + ctx.i18n.t('bs.war'),
        description: createWarOneLineString(battle),
        input_message_content: {
          message_text: createWarStats(now, battle, user) + '\n\n' + ctx.i18n.t('battle.inlineWar.info'),
          parse_mode: 'markdown'
        },
        reply_markup: Markup.inlineKeyboard([
          Markup.callbackButton(ctx.i18n.t('battle.inlineWar.updateButton'), `inlineWar:${user.alliance}:${user.name}`)
        ])
      })
    }

    statics.push({
      type: 'article',
      id: 'list',
      title: emoji.poweruser + ' ' + ctx.i18n.t('poweruser.list.title'),
      description: ctx.i18n.t('poweruser.list.description'),
      input_message_content: {
        message_text: `${createList([], now).text} ${emoji.poweruser}`,
        parse_mode: 'markdown'
      },
      reply_markup: createList([], now).keyboard
    })
  }

  let players = []
  const options = {
    is_personal: true,
    cache_time: 20
  }

  if (!isPoweruser) {
    options.switch_pm_text = ctx.i18n.t('poweruser.usefulWhen') + ' ' + emoji.poweruser
    options.switch_pm_parameter = 'be-a-poweruser'
  }

  if (isPoweruser && query && query.length >= 2) {
    const allPlayers = playerStatsDb.list()
    players = allPlayers
      .filter(o => queryTestFunc(createPlayerNameString(o)))
      .map(o => o.player)
  } else {
    const freeOptions = [...mystics]

    players = freeOptions
      .filter(o => queryTestFunc(o))
  }

  const playerResults = players
    .map(o => playerStatsDb.get(o))
    .sort(sortBy(o => o.battlesObserved, true))
    .slice(offset, offset + 20)
    .map(stats => {
      return {
        type: 'article',
        id: `player-${stats.player}`,
        title: createPlayerNameString(stats),
        description: createPlayerStatsShortString(stats),
        input_message_content: {
          message_text: createPlayerStatsString(stats),
          parse_mode: 'markdown'
        }
      }
    })

  if (players.length > offset + 20) {
    options.next_offset = offset + 20
  }

  if (process.env.NODE_ENV !== 'production') {
    options.cache_time = 2
  }

  return ctx.answerInlineQuery([
    ...statics,
    ...playerResults
  ], options)
})

function getTestFunctionForQuery(query) {
  try {
    const regex = new RegExp(query, 'i')
    return o => regex.test(o)
  } catch (error) {
    return o => o.includes(query)
  }
}

function answerInDirectChat(ctx, text, extra) {
  return ctx.tg.sendMessage(ctx.from.id, text, extra)
}

bot.action(/inlineWar:(.*):(.+)/, ctx => {
  const now = Date.now() / 1000
  const player = {
    alliance: ctx.match[1],
    name: ctx.match[2]
  }
  wars.addInlineMessageToUpdate(now, player, ctx.callbackQuery.inline_message_id)
  const {timestamp, battle} = wars.getCurrent(now, player.name) || {}
  if (!timestamp) {
    return ctx.editMessageText('This war seems over…')
  }

  const warText = createWarStats(timestamp, battle, player)
  return ctx.editMessageText(warText, Extra.markdown())
})

bot.action(/inlineList:join/, ctx => {
  const now = Date.now() / 1000
  const minTimestamp = getMidnightXDaysEarlier(now, 7)

  const {buildingsTimestamp, playerTimestamp} = ctx.session.gameInformation

  if (!playerTimestamp || playerTimestamp < minTimestamp) {
    const text = ctx.i18n.t('name.need')
    return Promise.all([
      answerInDirectChat(ctx, text).catch(() => {}),
      ctx.answerCbQuery(text, true)
    ])
  }

  if (!buildingsTimestamp) {
    const text = ctx.i18n.t('buildings.need.buildings')
    return Promise.all([
      answerInDirectChat(ctx, text),
      ctx.answerCbQuery(text, true)
    ])
  }

  let hint

  if (buildingsTimestamp < minTimestamp) {
    hint = ctx.i18n.t('buildings.old.buildings')
  }

  const userIds = inlineList.add(ctx.callbackQuery.inline_message_id, now, ctx.from.id)
  const {text, keyboard} = createList(userIds, now)
  return Promise.all([
    ctx.editMessageText(text, Extra.markdown().markup(keyboard)).catch(() => {}),
    ctx.answerCbQuery(hint)
  ])
})

bot.action(/inlineList:leave/, ctx => {
  const now = Date.now() / 1000
  const userIds = inlineList.remove(ctx.callbackQuery.inline_message_id, now, ctx.from.id)
  const {text, keyboard} = createList(userIds, now)
  return Promise.all([
    ctx.editMessageText(text, Extra.markdown().markup(keyboard)).catch(() => {}),
    ctx.answerCbQuery()
  ])
})

module.exports = {
  bot
}
