const Telegraf = require('telegraf')
const stringify = require('json-stable-stringify')

const {compareStrAsSimpleOne} = require('../lib/javascript-abstraction/strings')

const userSessions = require('../lib/data/user-sessions')

const AlertHandler = require('../lib/user-interface/alert-handler')
const {formatTimeAmount} = require('../lib/user-interface/format-number')

const {alertEmojis} = AlertHandler
const {Extra, Markup} = Telegraf

const bot = new Telegraf.Composer()
let alertHandler

function start(telegram) {
  console.time(`recreateAlerts`)
  alertHandler = new AlertHandler(telegram)
  userSessions.getRaw()
    .forEach(({user, data}) => {
      alertHandler.recreateAlerts(user, data)
    })
  console.timeEnd(`recreateAlerts`)
}

bot.use(async (ctx, next) => {
  const before = stringify(ctx.session)
  await next()
  const after = stringify(ctx.session)

  if (before !== after) {
    alertHandler.recreateAlerts(ctx.from.id, ctx.session)
  }
})

bot.command('upcoming', ctx => {
  const {text, extra} = generateUpcomingText(ctx)
  return ctx.reply(text, extra)
})

bot.action('upcoming', ctx => {
  const {text, extra} = generateUpcomingText(ctx)

  const oldText = ctx.callbackQuery.message.text
  if (compareStrAsSimpleOne(oldText, text) === 0) {
    return ctx.answerCbQuery(ctx.i18n.t('menu.nothingchanged'))
  }

  return Promise.all([
    ctx.answerCbQuery(),
    ctx.editMessageText(text, extra)
  ])
})

function generateUpcomingText(ctx) {
  const enabledAlerts = ctx.session.alerts || []
  const now = Date.now() / 1000
  const eventList = alertHandler.generateUpcomingEventsList(ctx.session)
    .filter(o => o.timestamp > now)
    .sort((a, b) => a.timestamp - b.timestamp)

  const entries = eventList
    .map(event => {
      let text = ''
      text += '*'
      text += enabledAlerts.includes(event.type) ? alertEmojis.enabled : alertEmojis.disabled
      text += alertEmojis[event.type]
      text += ' '
      text += formatTimeAmount((event.timestamp - now) / 60)
      text += '*'
      text += '\n'
      text += event.text
      return text
    })

  let text = `*${ctx.i18n.t('upcoming.title')}*`
  text += '\n' + ctx.i18n.t('upcoming.info')

  text += '\n'
  text += '\n' + entries.join('\n')
  if (entries.length === 0) {
    text += ctx.i18n.t('upcoming.noevents')
  }

  const extra = Extra
    .markdown()
    .markup(
      Markup.inlineKeyboard([
        Markup.callbackButton(ctx.i18n.t('upcoming.update'), 'upcoming')
      ])
    )
  return {text, extra}
}

module.exports = {
  bot,
  start
}
