import {BASTION_SIEGE_BOT_ID} from 'bastion-siege-logic'

export function isForwardedFromBastionSiege(ctx: any): boolean {
  return ctx && ctx.message && ctx.message.forward_from && ctx.message.forward_from.id === BASTION_SIEGE_BOT_ID
}
