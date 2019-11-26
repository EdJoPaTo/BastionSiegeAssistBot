import {Buildings, DomainStats, Effect, Player, Resources, Workshop} from 'bastion-siege-logic'

export interface PlayerHistory {
  buildings: PlayerHistoryEntry<Buildings>[];
  domainStats: PlayerHistoryEntry<DomainStats>[];
  effects: PlayerHistoryEntry<Effect[]>[];
  player: PlayerHistoryEntry<Player>[];
  resources: PlayerHistoryEntry<Resources>[];
  workshop: PlayerHistoryEntry<Workshop>[];
}

export interface PlayerHistoryEntry<T> {
  data: T;
  timestamp: number;
}