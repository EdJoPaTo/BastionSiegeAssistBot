import {BASTION_SIEGE_BOT_ID} from 'bastion-siege-logic'
import {Context} from 'telegraf'

export function isForwardedFromBastionSiege(ctx: Context): boolean {
  return ctx.message?.forward_from?.id === BASTION_SIEGE_BOT_ID
}
