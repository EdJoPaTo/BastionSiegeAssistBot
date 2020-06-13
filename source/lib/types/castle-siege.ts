import {Castle} from 'bastion-siege-logic'

type UnixTimestamp = number

export interface CastleInfo {
  readonly keeperAlliance?: string;
  readonly nextSiege?: UnixTimestamp;
}

export interface CastleSiegeEntry {
  readonly castle: Castle;
  readonly alliance: string;
  readonly player?: string;
  readonly timestamp: UnixTimestamp;
}

export interface CastleSiegePlayerEntry extends CastleSiegeEntry {
  readonly player: string;
}

export interface CastleSiegeInlineMessage {
  readonly timestamp: UnixTimestamp;
  readonly castle: Castle;
  readonly alliance: string;
  readonly inlineMessageId: string;
}
