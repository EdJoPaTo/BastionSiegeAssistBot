import {Gamescreen} from 'bastion-siege-logic'
import Telegraf, {Middleware, ContextMessageUpdate} from 'telegraf'
// TODO: wait for https://github.com/krmax44/always-array/pull/9
// import alwaysArray, {SingleOrArray} from 'always-array'

type GamescreenKey = keyof Gamescreen

type SingleOrArray<T> = T | (readonly T[])
function alwaysArray<T>(input: SingleOrArray<T>): readonly T[] {
  return Array.isArray(input) ? input : [input]
}

// When at least one of the name argument is available middlewares are executed
export function whenScreenContainsInformation(names: SingleOrArray<GamescreenKey>, ...middlewares: Middleware<ContextMessageUpdate>[]): (ctx: any, next: any) => void {
  const namesArr = alwaysArray(names)
  const predicate = (ctx: any): boolean => {
    if (!ctx.state.screen) {
      return false
    }

    const screen: Gamescreen = ctx.state.screen || {}
    const available = Object.keys(screen) as GamescreenKey[]
    return namesArr.some(n => available.includes(n))
  }

  return (Telegraf as any).optional(predicate, ...middlewares)
}

export function whenScreenIsOfType(wantedTypes: string | readonly string[], ...middlewares: Middleware<ContextMessageUpdate>[]): (ctx: any, next: any) => void {
  const typeArr = Array.isArray(wantedTypes) ? wantedTypes : [wantedTypes]

  const predicate = (ctx: any): boolean => {
    const screen = ctx.state.screen as Gamescreen
    if (!screen) {
      return false
    }

    return typeArr.some(n => screen.type === n)
  }

  return (Telegraf as any).optional(predicate, ...middlewares)
}

module.exports = {
  whenScreenContainsInformation,
  whenScreenIsOfType
}
