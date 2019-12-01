import {Castle} from 'bastion-siege-logic'

type UnixTimestamp = number

export interface CastleInfo {
  nextSiege?: UnixTimestamp;
}

export interface CastleSiegeEntry {
  castle: Castle;
  alliance: string;
  player?: string;
  timestamp: UnixTimestamp;
}

export interface CastleSiegePlayerEntry extends CastleSiegeEntry {
  player: string;
}
