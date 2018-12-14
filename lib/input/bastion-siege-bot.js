function isForwardedFromBastionSiege(ctx) {
  return ctx && ctx.message && ctx.message.forward_from && ctx.message.forward_from.id === 252148344
}

module.exports = {
  isForwardedFromBastionSiege
}
