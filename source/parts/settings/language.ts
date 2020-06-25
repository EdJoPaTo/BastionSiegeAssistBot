import {Extra, Markup} from 'telegraf'
import {MenuTemplate, Body} from 'telegraf-inline-menu'
import I18n from 'telegraf-i18n'

import {Context} from '../../lib/types'

import {backButtons} from '../../lib/user-interface/menu'
import {emoji} from '../../lib/user-interface/output-text'
import {getSupportGroupLink} from '../../lib/user-interface/support-group'

const localeEmoji = require('locale-emoji')

const i18n = new I18n({
  directory: 'locales'
})

function menuBody(ctx: Context): Body {
  let text = emoji.language + ` *${ctx.i18n.t('language.title')}*`
  text += '\n'
  text += ctx.i18n.t('language.info')
  return {text, parse_mode: 'Markdown'}
}

export const menu = new MenuTemplate<Context>(menuBody)

menu.select('lang', i18n.availableLocales(), {
  columns: 2,
  isSet: (ctx, key) => key.toLowerCase().startsWith(ctx.i18n.locale().toLowerCase()),
  set: (ctx, key) => {
    ctx.i18n.locale(key)
    return true
  },
  buttonText: (_ctx, key) => {
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

menu.interact(ctx => ctx.i18n.t('language.translateButton'), 'translate', {
  do: async ctx => {
    await ctx.replyWithDocument({
      source: `locales/${ctx.i18n.locale()}.yaml`
    }, new Extra({
      caption: ctx.i18n.t('language.helpTranslate')
    }).markdown().markup(
      Markup.inlineKeyboard([
        Markup.urlButton(ctx.i18n.t('help.joinBSAGroupButton'), getSupportGroupLink(ctx.i18n.locale()))
      ])
    ) as any)

    if (ctx.i18n.locale() !== 'en') {
      await ctx.replyWithDocument({
        source: 'locales/en.yaml'
      }, new Extra({
        caption: 'Reference Translation'
      }) as any)
    }

    const missingTranslations = i18n.missingKeys(ctx.i18n.locale())
    if (missingTranslations.length > 0) {
      const missingTranslationsText = missingTranslations
        .map(o => '`' + o + '`')
        .join('\n')
      await ctx.replyWithMarkdown(`Missing \`${ctx.i18n.locale()}\` translations:\n${missingTranslationsText}`)
    }

    return false
  }
})

menu.url(ctx => ctx.i18n.t('help.joinBSAGroupButton'), ctx => getSupportGroupLink(ctx.i18n.locale()))

menu.manualRow(backButtons)
