const Telegraf = require('telegraf')

const {emoji} = require('../lib/user-interface/output-text')

const {Extra, Markup} = Telegraf

const bot = new Telegraf.Composer()

bot.command(['start', 'help'], ctx => {
  const text = ctx.i18n.t('help.full')

  const keyboard = Markup.inlineKeyboard([
    Markup.switchToCurrentChatButton(ctx.i18n.t('help.trySearchButton'), ''),
    Markup.urlButton(ctx.i18n.t('help.joinBSAGroupButton'), 'https://t.me/joinchat/AC0dV1dG2Y7sOFQPtZm9Dw')
  ], {columns: 1})
  return ctx.replyWithMarkdown(text, Extra.markup(keyboard))
})

bot.command(['search', 'army'], ctx => {
  ctx.match = /\S+ (.+)/.exec(ctx.message.text)
  const argument = ctx.match && ctx.match[1]

  const text = ctx.i18n.t('help.search', {name: argument || 'Dragon'})
  const keyboard = Markup.inlineKeyboard([
    Markup.switchToCurrentChatButton(ctx.i18n.t('help.trySearchButton'), argument || '')
  ])
  return ctx.replyWithMarkdown(text, Extra.markup(keyboard))
})

bot.on('text', (ctx, next) => {
  if (!ctx.message.forward_from && ctx.chat.id === ctx.from.id &&
    (ctx.message.text.includes(emoji.battlereport) ||
    ctx.message.text.includes(emoji.poweruser))
  ) {
    // Thats an inline query. Ignore :)
    return next()
  }

  const text = ctx.i18n.t('help.short')

  const keyboard = Markup.inlineKeyboard([
    Markup.urlButton(ctx.i18n.t('help.joinBSAGroupButton'), 'https://t.me/joinchat/AC0dV1dG2Y7sOFQPtZm9Dw')
  ])
  return ctx.replyWithMarkdown(text, Extra.markup(keyboard))
})

module.exports = {
  bot
}
