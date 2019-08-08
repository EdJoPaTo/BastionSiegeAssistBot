type Dictionary<T> = {[key: string]: T}

export type InlineListParticipantAdd = {}

export interface InlineListParticipant extends InlineListParticipantAdd {
  lastUpdate: number;
}

export interface InlineList {
  lastUpdate: number;
  participants: Dictionary<InlineListParticipant>;
}
