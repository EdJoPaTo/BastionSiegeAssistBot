import {BattleAlliance} from 'bastion-siege-logic'

type UnixTimestamp = number

export interface WarInlineMessage {
  readonly inlineMessageId: string;
  readonly player: {
    readonly alliance: string;
    readonly name: string;
  };
}

export interface WarNotificationMessage {
  readonly timestamp: UnixTimestamp;
  readonly player: string;
  readonly chatId: number;
  readonly messageId: number;
}

export interface War {
  battle: BattleAlliance;
  beginTimestamp: UnixTimestamp;
  timestamp: UnixTimestamp;
  readonly inlineMessages: WarInlineMessage[];
  readonly notificationMessages: WarNotificationMessage[];
}
