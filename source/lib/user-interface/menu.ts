import {createBackMainMenuButtons} from 'telegraf-inline-menu'
import {I18nContext} from '@edjopato/telegraf-i18n'

export function buttonText(emoji: string, i18nKey: string): (ctx: {i18n: I18nContext}) => string {
  return ctx => `${emoji} ${ctx.i18n.t(i18nKey)}`
}

export const backButtons = createBackMainMenuButtons<{i18n: I18nContext}>(ctx => `🔙 ${ctx.i18n.t('menu.back')}…`)
