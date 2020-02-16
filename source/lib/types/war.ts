import {BattleAlliance} from 'bastion-siege-logic'

type UnixTimestamp = number

export interface WarInlineMessage {
  inlineMessageId: string;
  player: {
    alliance: string;
    name: string;
  };
}

export interface War {
  battle: BattleAlliance;
  beginTimestamp: UnixTimestamp;
  timestamp: UnixTimestamp;
  inlineMessages: WarInlineMessage[];
}
