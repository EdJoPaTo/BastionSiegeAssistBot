export interface CastleSiegeEntry {
  alliance: string;
  player?: string;
  timestamp: number;
}

export interface CastleSiegePlayerEntry extends CastleSiegeEntry {
  player: string;
}
