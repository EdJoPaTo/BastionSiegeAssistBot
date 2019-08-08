import {BattleAlliance} from 'bastion-siege-logic'

export interface WarInlineMessage {
  inlineMessageId: string;
  player: {
    alliance: string;
    name: string;
  };
}

export interface War {
  battle: BattleAlliance;
  beginTimestamp: number;
  timestamp: number;
  inlineMessages: WarInlineMessage[];
}
