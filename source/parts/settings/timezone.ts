import {listTimeZones} from 'timezone-support'
import {markdown as format} from 'telegram-format'
import {MenuTemplate, Body} from 'telegraf-inline-menu'
import arrayFilterUnique from 'array-filter-unique'

import {Context} from '../../lib/types'

import {backButtons} from '../../lib/user-interface/menu'
import {emoji} from '../../lib/user-interface/output-text'

const tzNormal = listTimeZones()
  .map(o => o.split('/'))
  .filter(o => o.length >= 2)

const tzPrefixesRaw = tzNormal
  .map(o => o[0])
  .filter(arrayFilterUnique())

function tzPrefixes(ctx: Context): string[] {
  const {__language_code: locale} = ctx.session
  return tzPrefixesRaw
    .sort((a, b) => a.localeCompare(b, locale === 'wikidatanish' ? 'en' : locale))
}

function tzInPrefix(ctx: Context): string[] {
  const {__language_code: locale} = ctx.session
  const prefix = ctx.match![1]
  return tzNormal
    .filter(o => o[0] === prefix)
    .map(o => o.slice(1).join('/'))
    .sort((a, b) => a.localeCompare(b, locale === 'wikidatanish' ? 'en' : locale))
}

function menuBody(ctx: Context): Body {
  const {__language_code: locale} = ctx.session
  const current = ctx.session.timeZone || 'UTC'

  let text = ''
  text += emoji.timezone
  text += format.bold(format.escape(ctx.i18n.t('setting.timezone')))
  text += '\n\n'

  text += format.escape(current)
  text += ':\n  '
  text += new Date().toLocaleString(locale, {
    timeZone: current
  })
  text += '\n\n'

  if (ctx.match instanceof Object && ctx.match[1]) {
    text += format.bold(format.escape(ctx.match[1]))
    text += '\n\n'
  }

  return {text, parse_mode: format.parse_mode}
}

export const menu = new MenuTemplate<Context>(menuBody)

const specificMenu = new MenuTemplate<Context>(menuBody)

function utcButtonText(ctx: Context): string {
  let text = ''
  if (!ctx.session.timeZone) {
    text += '✅'
  }

  text += 'UTC'
  return text
}

menu.interact(utcButtonText, 'utc', {
  do: async ctx => {
    delete ctx.session.timeZone
    return '.'
  }
})

menu.chooseIntoSubmenu('s', tzPrefixes, specificMenu, {
  columns: 2,
  getCurrentPage: ctx => ctx.session.page,
  setPage: (ctx, page) => {
    ctx.session.page = page
  }
})

specificMenu.select('s', tzInPrefix, {
  columns: 2,
  isSet: (ctx, key) => ctx.session.timeZone === createTz(ctx.match, key),
  set: (ctx, key) => {
    ctx.session.timeZone = createTz(ctx.match, key)
  },
  getCurrentPage: ctx => ctx.session.page,
  setPage: (ctx, page) => {
    ctx.session.page = page
  }
})

specificMenu.manualRow(backButtons)

menu.manualRow(backButtons)

function createTz(match: RegExpMatchArray | undefined | null, key: string): string {
  const prefix = match?.[1]
  const tz = prefix ? `${prefix}/${key}` : key
  return tz
}
