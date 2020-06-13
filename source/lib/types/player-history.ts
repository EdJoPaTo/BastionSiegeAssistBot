import {Buildings, DomainStats, Effect, Player, Resources, Workshop} from 'bastion-siege-logic'

export interface PlayerHistory {
  readonly buildings: Array<PlayerHistoryEntry<Buildings>>;
  readonly domainStats: Array<PlayerHistoryEntry<DomainStats>>;
  readonly effects: Array<PlayerHistoryEntry<Effect[]>>;
  readonly player: Array<PlayerHistoryEntry<Player>>;
  readonly resources: Array<PlayerHistoryEntry<Resources>>;
  readonly workshop: Array<PlayerHistoryEntry<Workshop>>;
}

export interface PlayerHistoryLatest {
  readonly buildings?: PlayerHistoryEntry<Buildings>;
  readonly domainStats?: PlayerHistoryEntry<DomainStats>;
  readonly effects?: PlayerHistoryEntry<Effect[]>;
  readonly player?: PlayerHistoryEntry<Player>;
  readonly resources?: PlayerHistoryEntry<Resources>;
  readonly workshop?: PlayerHistoryEntry<Workshop>;
}

export interface PlayerHistoryEntry<T> {
  readonly data: T;
  readonly timestamp: number;
}
