import {Buildings, DomainStats, Effect, Player, Resources, Workshop} from 'bastion-siege-logic'

export interface PlayerHistory {
  readonly buildings: PlayerHistoryEntry<Buildings>[];
  readonly domainStats: PlayerHistoryEntry<DomainStats>[];
  readonly effects: PlayerHistoryEntry<Effect[]>[];
  readonly player: PlayerHistoryEntry<Player>[];
  readonly resources: PlayerHistoryEntry<Resources>[];
  readonly workshop: PlayerHistoryEntry<Workshop>[];
}

export interface PlayerHistoryEntry<T> {
  readonly data: T;
  readonly timestamp: number;
}
