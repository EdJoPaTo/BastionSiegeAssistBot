// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface InlineListParticipantAdd {
}

export interface InlineListParticipant extends InlineListParticipantAdd {
  readonly lastUpdate: number;
}

export interface InlineList {
  lastUpdate: number;
  participants: Record<number, InlineListParticipant>;
}
