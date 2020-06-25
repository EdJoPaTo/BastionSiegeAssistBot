import {Composer, Extra, Markup, Context as TelegrafContext} from 'telegraf'

import {Context} from '../lib/types'

import {emoji} from '../lib/user-interface/output-text'
import {getSupportGroupLink} from '../lib/user-interface/support-group'

export const bot = new Composer<Context>()

bot.command(['start', 'help'], async ctx => {
  const text = ctx.i18n.t('help.full')

  const keyboard = Markup.inlineKeyboard([
    Markup.switchToCurrentChatButton(ctx.i18n.t('help.trySearchButton'), ''),
    Markup.urlButton(ctx.i18n.t('help.joinBSAGroupButton'), getSupportGroupLink(ctx.i18n.locale()))
  ], {columns: 1})
  await ctx.replyWithMarkdown(text, Extra.markup(keyboard))
})

bot.command(['search', 'army'], async ctx => {
  ctx.match = /\S+ (.+)/.exec(ctx.message!.text!) || undefined
  const argument = ctx.match?.[1]

  const text = ctx.i18n.t('help.search', {name: argument || 'Dragon'})
  const keyboard = Markup.inlineKeyboard([
    Markup.switchToCurrentChatButton(ctx.i18n.t('help.trySearchButton'), argument || '')
  ])
  await ctx.replyWithMarkdown(text, Extra.markup(keyboard))
})

function isAnOwnInlineQuery(ctx: TelegrafContext): boolean {
  if (!ctx.message?.text || ctx.message.forward_from) {
    return false
  }

  // Message is not from the user
  if (!ctx.from || !ctx.chat?.id || ctx.chat.id !== ctx.from.id) {
    return false
  }

  const {text} = ctx.message
  return text.includes(emoji.battlereport) || text.includes(emoji.poweruser)
}

bot.on('text', Composer.optional(ctx => !isAnOwnInlineQuery(ctx), async ctx => {
  const text = ctx.i18n.t('help.short')

  const keyboard = Markup.inlineKeyboard([
    Markup.urlButton(ctx.i18n.t('help.joinBSAGroupButton'), getSupportGroupLink(ctx.i18n.locale()))
  ])
  await ctx.replyWithMarkdown(text, Extra.markup(keyboard))
}))
