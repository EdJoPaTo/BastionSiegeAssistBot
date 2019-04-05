const Telegraf = require('telegraf')

// When at least one of the name argument is available middlewares are executed
function whenScreenContainsInformation(names, ...middlewares) {
  const namesArr = Array.isArray(names) ? names : [names]
  const predicate = ctx => {
    if (!ctx.state.screen) {
      return false
    }

    const available = Object.keys(ctx.state.screen || {})
    return namesArr.some(n => available.includes(n))
  }

  return Telegraf.optional(predicate, ...middlewares)
}

function whenScreenIsOfType(wantedTypes, ...middlewares) {
  const typeArr = Array.isArray(wantedTypes) ? wantedTypes : [wantedTypes]

  const predicate = ctx => {
    if (!ctx.state.screen) {
      return false
    }

    return typeArr.some(n => ctx.state.screen.type === n)
  }

  return Telegraf.optional(predicate, ...middlewares)
}

module.exports = {
  whenScreenContainsInformation,
  whenScreenIsOfType
}
