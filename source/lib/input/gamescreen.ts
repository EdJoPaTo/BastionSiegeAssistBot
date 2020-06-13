import {Gamescreen} from 'bastion-siege-logic'
import {Middleware, Context as TelegrafContext, Composer} from 'telegraf'

type GamescreenKey = keyof Gamescreen
type SingleOrArray<T> = T | (readonly T[])

// When at least one of the name argument is available middlewares are executed
export function whenScreenContainsInformation<Context extends TelegrafContext>(names: SingleOrArray<GamescreenKey>, ...middlewares: ReadonlyArray<Middleware<Context>>): (ctx: Context, next: () => Promise<void>) => void | Promise<unknown> {
  const namesArray = Array.isArray(names) ? names : [names]
  const predicate = (ctx: any): boolean => {
    if (!ctx.state.screen) {
      return false
    }

    const screen: Gamescreen = ctx.state.screen || {}
    const available = Object.keys(screen) as GamescreenKey[]
    return namesArray.some(n => available.includes(n))
  }

  return Composer.optional(predicate, ...middlewares)
}

export function whenScreenIsOfType<Context extends TelegrafContext>(wantedTypes: SingleOrArray<string>, ...middlewares: ReadonlyArray<Middleware<Context>>): (ctx: Context, next: () => Promise<void>) => void | Promise<unknown> {
  const typeArray = Array.isArray(wantedTypes) ? wantedTypes : [wantedTypes]

  const predicate = (ctx: any): boolean => {
    const screen = ctx.state.screen as Gamescreen
    if (!screen) {
      return false
    }

    return typeArray.some(n => screen.type === n)
  }

  return Composer.optional(predicate, ...middlewares)
}
