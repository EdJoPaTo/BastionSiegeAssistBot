import {Extra, Markup} from 'telegraf'
import I18n from 'telegraf-i18n'
import TelegrafInlineMenu from 'telegraf-inline-menu'

import {emoji} from '../../lib/user-interface/output-text'

/* eslint @typescript-eslint/no-var-requires: warn */
/* eslint @typescript-eslint/no-require-imports: warn */
const localeEmoji = require('locale-emoji')

const i18n = new I18n({
  directory: 'locales'
})

function menuText(ctx: any): string {
  let text = emoji.language + ` *${ctx.i18n.t('language.title')}*`
  text += '\n'
  text += ctx.i18n.t('language.info')
  return text
}

export const menu = new TelegrafInlineMenu(menuText)

menu.select('lang', i18n.availableLocales(), {
  columns: 2,
  isSetFunc: (ctx: any, key) => key.toLowerCase().startsWith(ctx.i18n.locale().toLowerCase()),
  setFunc: (ctx: any, key) => ctx.i18n.locale(key),
  textFunc: (_ctx, key) => {
    let result = ''
    result += localeEmoji(key)
    result += ' '
    result += key

    const progress = i18n.translationProgress(key)
    if (progress !== 1) {
      result += ` (${(progress * 100).toFixed(1)}%)`
    }

    return result
  }
})

menu.simpleButton((ctx: any) => ctx.i18n.t('language.translateButton'), 'translate', {
  doFunc: async (ctx: any) => {
    await ctx.replyWithDocument({
      source: `locales/${ctx.i18n.locale()}.yaml`
    }, new Extra({
      caption: ctx.i18n.t('language.helpTranslate')
    }).markdown().markup(
      Markup.inlineKeyboard([
        Markup.urlButton(ctx.i18n.t('help.joinBSAGroupButton'), 'https://t.me/joinchat/AC0dV1dG2Y7sOFQPtZm9Dw')
      ])
    ))

    if (ctx.i18n.locale() !== 'en') {
      await ctx.replyWithDocument({
        source: 'locales/en.yaml'
      }, new Extra({
        caption: 'Reference Translation'
      }))
    }

    const missingTranslations = i18n.missingKeys(ctx.i18n.locale())
    if (missingTranslations.length > 0) {
      const missingTranslationsText = missingTranslations
        .map(o => '`' + o + '`')
        .join('\n')
      await ctx.replyWithMarkdown(`Missing \`${ctx.i18n.locale()}\` translations:\n${missingTranslationsText}`)
    }
  }
})

menu.urlButton((ctx: any) => ctx.i18n.t('help.joinBSAGroupButton'), 'https://t.me/joinchat/AC0dV1dG2Y7sOFQPtZm9Dw')
