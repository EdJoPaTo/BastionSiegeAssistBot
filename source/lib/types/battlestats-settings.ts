import {BattlereportResource} from 'bastion-siege-logic'

export type BattlestatsView = 'solo' | 'allianceMates' | 'allianceSolo' | 'allianceAttacks'

export const BATTLESTATS_VIEW: readonly BattlestatsView[] = ['solo', 'allianceMates', 'allianceSolo', 'allianceAttacks']

export interface BattlestatsSettings {
  timeframe?: string;
  type?: BattlereportResource;
  view?: BattlestatsView;
}
