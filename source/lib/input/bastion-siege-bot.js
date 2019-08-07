const {BASTION_SIEGE_BOT_ID} = require('bastion-siege-logic')

function isForwardedFromBastionSiege(ctx) {
  return ctx && ctx.message && ctx.message.forward_from && ctx.message.forward_from.id === BASTION_SIEGE_BOT_ID
}

module.exports = {
  isForwardedFromBastionSiege
}
