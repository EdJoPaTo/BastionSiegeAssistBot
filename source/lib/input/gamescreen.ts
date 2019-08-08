import Telegraf from 'telegraf'

// When at least one of the name argument is available middlewares are executed
export function whenScreenContainsInformation(names: string | readonly string[], ...middlewares: any[]): (ctx: any, next: any) => void {
  const namesArr = Array.isArray(names) ? names : [names]
  const predicate = (ctx: any): boolean => {
    if (!ctx.state.screen) {
      return false
    }

    const available = Object.keys(ctx.state.screen || {})
    return namesArr.some(n => available.includes(n))
  }

  return (Telegraf as any).optional(predicate, ...middlewares)
}

export function whenScreenIsOfType(wantedTypes: string | readonly string[], ...middlewares: any[]): (ctx: any, next: any) => void {
  const typeArr = Array.isArray(wantedTypes) ? wantedTypes : [wantedTypes]

  const predicate = (ctx: any): boolean => {
    if (!ctx.state.screen) {
      return false
    }

    return typeArr.some(n => ctx.state.screen.type === n)
  }

  return (Telegraf as any).optional(predicate, ...middlewares)
}

module.exports = {
  whenScreenContainsInformation,
  whenScreenIsOfType
}
