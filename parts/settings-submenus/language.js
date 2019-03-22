const {Extra, Markup} = require('telegraf')
const countryEmoji = require('country-emoji')
const I18n = require('telegraf-i18n')
const TelegrafInlineMenu = require('telegraf-inline-menu')

const {emoji} = require('../../lib/user-interface/output-text')

// First language code: https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes
// Second country code: https://en.wikipedia.org/wiki/ISO_3166-1
const AVAILABLE_LANGUAGES = [
  'de',
  'en-GB',
  'id',
  'ru'
]

const i18n = new I18n({
  directory: 'locales'
})

function menuText(ctx) {
  let text = emoji.language + ` *${ctx.i18n.t('language.title')}*`
  text += '\n' + ctx.i18n.t('language.info')
  return text
}

const menu = new TelegrafInlineMenu(menuText)

menu.select('lang', AVAILABLE_LANGUAGES, {
  columns: 2,
  isSetFunc: (ctx, key) => key.toLowerCase().startsWith(ctx.i18n.locale().toLowerCase()),
  setFunc: (ctx, key) => ctx.i18n.locale(key),
  textFunc: (_ctx, key) => {
    const countryCode = key.split('-').slice(-1)[0]
    const lang = key.split('-')[0]

    let result = countryEmoji.flag(countryCode) + ' ' + lang

    const progress = i18n.translationProgress(lang)
    if (progress !== 1) {
      result += ` (${(progress * 100).toFixed(1)}%)`
    }

    return result
  }
})

menu.simpleButton(ctx => ctx.i18n.t('language.translateButton'), 'translate', {
  doFunc: async ctx => {
    await ctx.replyWithDocument({
      source: `locales/${ctx.i18n.locale().split('-')[0]}.yaml`
    }, new Extra({
      caption: ctx.i18n.t('language.helpTranslate')
    }).markdown().markup(
      Markup.inlineKeyboard([
        Markup.urlButton(ctx.i18n.t('help.joinBSAGroupButton'), 'https://t.me/joinchat/AC0dV1dG2Y7sOFQPtZm9Dw')
      ])
    ))

    if (ctx.i18n.locale().split('-')[0] !== 'en') {
      await ctx.replyWithDocument({
        source: 'locales/en.yaml'
      }, new Extra({
        caption: 'Reference Translation'
      }))
    }

    const missingTranslations = i18n.missingKeys(ctx.i18n.locale().split('-')[0])
    if (missingTranslations.length > 0) {
      const missingTranslationsText = missingTranslations
        .map(o => '`' + o + '`')
        .join('\n')
      await ctx.replyWithMarkdown(`Missing \`${ctx.i18n.locale().split('-')[0]}\` translations:\n${missingTranslationsText}`,)
    }
  }
})

menu.urlButton(ctx => ctx.i18n.t('help.joinBSAGroupButton'), 'https://t.me/joinchat/AC0dV1dG2Y7sOFQPtZm9Dw')

module.exports = {
  menu
}
