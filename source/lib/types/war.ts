import {BattleAlliance} from 'bastion-siege-logic'

type UnixTimestamp = number

export interface WarInlineMessage {
  inlineMessageId: string;
  player: {
    alliance: string;
    name: string;
  };
}

export interface WarNotificationMessage {
  timestamp: UnixTimestamp;
  player: string;
  chatId: number;
  messageId: number;
}

export interface War {
  battle: BattleAlliance;
  beginTimestamp: UnixTimestamp;
  timestamp: UnixTimestamp;
  inlineMessages: WarInlineMessage[];
  notificationMessages: WarNotificationMessage[];
}
