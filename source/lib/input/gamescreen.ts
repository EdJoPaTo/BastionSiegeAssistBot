import {Gamescreen} from 'bastion-siege-logic'
import {Middleware, Composer} from 'telegraf'

import {AnalysedGamescreen} from '../data/ingame/parse'
import {Context} from '../types'

type ContextWithState = Context & {from: NonNullable<Context['from']>; message: NonNullable<Context['message']>; state: AnalysedGamescreen}

type GamescreenKey = keyof Gamescreen
type SingleOrArray<T> = T | (readonly T[])

// When at least one of the name argument is available middlewares are executed
export function whenScreenContainsInformation(names: SingleOrArray<GamescreenKey>, ...middlewares: ReadonlyArray<Middleware<ContextWithState>>): (ctx: Context, next: () => Promise<void>) => void | Promise<unknown> {
  const namesArray = Array.isArray(names) ? names : [names]
  const predicate = (ctx: Context): boolean => {
    const screen = ctx.state?.screen
    if (!screen) {
      return false
    }

    const available = Object.keys(screen) as GamescreenKey[]
    return namesArray.some(n => available.includes(n))
  }

  return Composer.optional(predicate, ...middlewares as any)
}

export function whenScreenIsOfType(wantedTypes: SingleOrArray<string>, ...middlewares: ReadonlyArray<Middleware<ContextWithState>>): (ctx: Context, next: () => Promise<void>) => void | Promise<unknown> {
  const typeArray = Array.isArray(wantedTypes) ? wantedTypes : [wantedTypes]

  const predicate = (ctx: Context): boolean => {
    const screen = ctx.state?.screen
    if (!screen) {
      return false
    }

    return typeArray.some(n => screen.type === n)
  }

  return Composer.optional(predicate, ...middlewares as any)
}
