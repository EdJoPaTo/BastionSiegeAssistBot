const Telegraf = require('telegraf')
const stringify = require('json-stable-stringify')

const userSessions = require('../lib/data/user-sessions')

const AlertHandler = require('../lib/user-interface/alert-handler')
const {formatTimeAmount} = require('../lib/user-interface/format-number')

const {alertEmojis} = AlertHandler
const {Extra, Markup} = Telegraf

const bot = new Telegraf.Composer()
let alertHandler

function start(telegram) {
  alertHandler = new AlertHandler(telegram)
  userSessions.getRaw()
    .forEach(({user, data}) => {
      const {alerts} = data
      alertHandler.recreateAlerts(user, alerts, data)
    })
}

bot.use(async (ctx, next) => {
  const before = stringify(ctx.session)
  await next()
  const after = stringify(ctx.session)

  if (before !== after) {
    alertHandler.recreateAlerts(ctx.from.id, ctx.session.alerts, ctx.session)
  }
})

bot.command('upcoming', ctx => {
  const {text, extra} = generateUpcomingText(ctx)
  return ctx.reply(text, extra)
})

bot.action('upcoming', ctx => {
  const {text, extra} = generateUpcomingText(ctx)
  return Promise.all([
    ctx.answerCbQuery(),
    ctx.editMessageText(text, extra)
  ])
})

function generateUpcomingText(ctx) {
  const enabledAlerts = ctx.session.alerts
  const now = Date.now() / 1000
  const eventList = alertHandler.generateUpcomingEventsList(ctx.session)
    .filter(o => o.timestamp > now)
    .sort((a, b) => a.timestamp - b.timestamp)

  const entries = eventList
    .map(event => {
      let text = ''
      text += '*'
      text += enabledAlerts.indexOf(event.type) >= 0 ? alertEmojis.enabled : alertEmojis.disabled
      text += alertEmojis[event.type]
      text += ' '
      text += formatTimeAmount((event.timestamp - now) / 60)
      text += '*'
      text += '\n'
      text += new Date(event.timestamp * 1000).toISOString()
      text += '\n'
      text += event.text
      return text
    })

  let text = '*Upcoming Alerts*'
  text += '\nYou can select which alerts you want to receive in the /settings.'

  text += '\n'
  text += '\nnow: ' + new Date(now * 1000).toISOString()

  text += '\n'
  text += '\n' + entries.join('\n')
  if (entries.length === 0) {
    text += 'There are no upcoming events…'
  }

  const extra = Extra
    .markdown()
    .markup(
      Markup.inlineKeyboard([
        Markup.callbackButton('update', 'upcoming')
      ])
    )
  return {text, extra}
}

module.exports = {
  bot,
  start
}
