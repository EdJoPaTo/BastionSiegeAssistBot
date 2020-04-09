import {Composer, Extra, Markup, Telegram} from 'telegraf'
import stringify from 'json-stable-stringify'

import {compareStrAsSimpleOne} from '../lib/javascript-abstraction/strings'
import {sortBy} from '../lib/javascript-abstraction/array'

import {Session} from '../lib/types'

import * as userSessions from '../lib/data/user-sessions'

import {emoji} from '../lib/user-interface/output-text'
import {formatTimeAmount} from '../lib/user-interface/format-number'
import {AlertHandler} from '../lib/user-interface/alert-handler'

export const bot = new Composer()
let alertHandler: AlertHandler

export function start(telegram: Telegram): void {
  console.time('recreateAlerts')
  const now = Date.now() / 1000
  alertHandler = new AlertHandler(telegram)
  userSessions.getRaw()
    .forEach(({user, data}) => {
      alertHandler.recreateAlerts(user, data, now)
    })
  console.timeEnd('recreateAlerts')
}

bot.use(async (ctx: any, next) => {
  const now = Date.now() / 1000
  const before = stringify(ctx.session)
  await next?.()
  const after = stringify(ctx.session)

  if (before !== after) {
    alertHandler.recreateAlerts(ctx.from.id, ctx.session, now)
  }
})

bot.command('upcoming', async ctx => {
  const {text, extra} = generateUpcomingText(ctx)
  return ctx.reply(text, extra)
})

bot.action('upcoming', async ctx => {
  const {text, extra} = generateUpcomingText(ctx)

  const oldText = ctx.callbackQuery!.message!.text!
  if (compareStrAsSimpleOne(oldText, text) === 0) {
    return ctx.answerCbQuery((ctx as any).i18n.t('menu.nothingchanged'))
  }

  return Promise.all([
    ctx.answerCbQuery(),
    ctx.editMessageText(text, extra)
  ])
})

function generateUpcomingText(ctx: any): {text: string; extra: any} {
  const session = ctx.session as Session
  const enabledAlerts = session.alerts ?? []
  const now = Date.now() / 1000
  const eventList = alertHandler.generateUpcomingEventsList(session, now)
    .filter(o => o.timestamp > now)
    .sort(sortBy(o => o.timestamp))

  const entries = eventList
    .map(event => {
      let text = ''
      text += '*'
      text += enabledAlerts.includes(event.type) ? emoji.alertEnabled : emoji.alertDisabled
      text += emoji[event.type]
      text += ' '
      text += formatTimeAmount((event.timestamp - now) / 60)
      text += '*'
      text += '\n'
      text += event.text
      return text
    })

  let text = `*${ctx.i18n.t('upcoming.title')}*`
  text += '\n'
  text += ctx.i18n.t('upcoming.info')

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
