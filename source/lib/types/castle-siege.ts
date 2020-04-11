import {Castle} from 'bastion-siege-logic'

type UnixTimestamp = number

export interface CastleInfo {
  keeperAlliance?: string;
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

export interface CastleSiegeInlineMessage {
  readonly timestamp: UnixTimestamp;
  readonly castle: Castle;
  readonly alliance: string;
  readonly inlineMessageId: string;
}
