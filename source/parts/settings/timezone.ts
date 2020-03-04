import {listTimeZones} from 'timezone-support'
import {markdown as format} from 'telegram-format'
import arrayFilterUnique from 'array-filter-unique'
import TelegrafInlineMenu from 'telegraf-inline-menu'

import {Session} from '../../lib/types'

import {emoji} from '../../lib/user-interface/output-text'

const tzNormal = listTimeZones()
  .map(o => o.split('/'))
  .filter(o => o.length >= 2)

const tzPrefixesRaw = tzNormal
  .map(o => o[0])
  .filter(arrayFilterUnique())

function tzPrefixes(ctx: any): string[] {
  const {__language_code: locale} = ctx.session as Session
  return tzPrefixesRaw
    .sort((a, b) => a.localeCompare(b, locale === 'wikidatanish' ? 'en' : locale))
}

function tzInPrefix(ctx: any): string[] {
  const {__language_code: locale} = ctx.session as Session
  const prefix = ctx.match[1]
  return tzNormal
    .filter(o => o[0] === prefix)
    .map(o => o.slice(1).join('/'))
    .sort((a, b) => a.localeCompare(b, locale === 'wikidatanish' ? 'en' : locale))
}

function menuText(ctx: any): string {
  const {__language_code: locale} = ctx.session as Session
  const session = ctx.session as Session
  const current = session.timeZone || 'UTC'

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

  return text
}

export const menu = new TelegrafInlineMenu(menuText)

const specificMenu = new TelegrafInlineMenu(menuText)

function utcButtonText(ctx: any): string {
  const session = ctx.session as Session
  let text = ''
  if (!session.timeZone) {
    text += '✅'
  }

  text += 'UTC'
  return text
}

menu.button(utcButtonText, 'utc', {
  doFunc: (ctx: any) => {
    const session = ctx.session as Session
    delete session.timeZone
  }
})

menu.selectSubmenu('s', tzPrefixes, specificMenu, {
  columns: 2,
  getCurrentPage,
  setPage
})

specificMenu.select('s', tzInPrefix, {
  columns: 2,
  isSetFunc,
  setFunc,
  getCurrentPage,
  setPage
})

function createTz(match: RegExpMatchArray | undefined, key: string): string {
  const prefix = match && match[1]
  const tz = prefix ? `${prefix}/${key}` : key
  return tz
}

function isSetFunc(ctx: any, key: string): boolean {
  const session = ctx.session as Session
  return session.timeZone === createTz(ctx.match, key)
}

function setFunc(ctx: any, key: string): void {
  const session = ctx.session as Session
  session.timeZone = createTz(ctx.match, key)
}

function getCurrentPage(ctx: any): number | undefined {
  const session = ctx.session as Session
  return session.page
}

function setPage(ctx: any, page: number): void {
  const session = ctx.session as Session
  session.page = page
}
