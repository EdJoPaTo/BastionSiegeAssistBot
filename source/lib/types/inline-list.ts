/* eslint @typescript-eslint/no-empty-interface: off */
export interface InlineListParticipantAdd {
}

export interface InlineListParticipant extends InlineListParticipantAdd {
  lastUpdate: number;
}

export interface InlineList {
  lastUpdate: number;
  participants: Record<number, InlineListParticipant>;
}
