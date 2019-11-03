export function buttonText(emoji: string, i18nKey: string): (ctx: any) => string {
  return ctx => `${emoji} ${ctx.i18n.t(i18nKey)}`
}
