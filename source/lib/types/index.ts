import {Context as TelegrafContext} from 'telegraf'
import {I18n} from 'telegraf-i18n'

import {AnalysedGamescreen} from '../data/ingame/parse'

import {Session} from './session'

export * from './battle-stats'
export * from './battlereport'
export * from './battlestats-settings'
export * from './castle-siege'
export * from './failed-bs-message'
export * from './inline-list'
export * from './player-stats'
export * from './player'
export * from './poweruser'
export * from './session'
export * from './war'

export interface Context extends TelegrafContext {
  readonly i18n: I18n;
  readonly session: Session;
  readonly state?: AnalysedGamescreen;
}
