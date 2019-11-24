import {ConstructionName, Buildings, DomainStats, Effect, Player, Resources, Workshop} from 'bastion-siege-logic'

import {BattlestatsSettings} from './battlestats-settings'

export type BuildingView = 'upgrades' | 'history' | 'fillStorage' | 'income' | 'winChances'
export const BUILDING_VIEWS: BuildingView[] = ['upgrades', 'history', 'fillStorage', 'income', 'winChances']

export type Alert = 'buildingUpgrade' | 'effect' | 'nextBattle' | 'resourceWarning'
export const ALERTS: Alert[] = ['buildingUpgrade', 'effect', 'nextBattle', 'resourceWarning']

export interface GameInformation {
  battleAllianceTimestamp?: number;
  battleSoloTimestamp?: number;

  buildings?: Buildings;
  buildingsTimestamp?: number;

  domainStats?: DomainStats;
  domainStatsTimestamp?: number;

  effects?: Effect[];
  effectsTimestamp?: number;

  player?: Player;
  playerTimestamp?: number;

  resources?: Resources;
  resourcesTimestamp?: number;

  workshop?: Workshop;
  workshopTimestamp?: number;
}

export interface Session {
  __language_code?: string;
  __username?: string;
  alerts?: Alert[];
  battlestats?: BattlestatsSettings;
  buildings?: ConstructionName[];
  buildingsHistoryTimeframe?: string;
  buildingsTimeframe?: string;
  buildingsView?: BuildingView;
  disableImmunity?: boolean;
  gameInformation: GameInformation;
  lastHintTimestamp?: number;
  page?: number;
  timeZone?: string;
}
