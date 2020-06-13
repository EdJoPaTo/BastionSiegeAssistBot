export interface FailedBSMessage {
  readonly from: {
    readonly id: number;
  };
  readonly text: string;
  readonly forward_date: number;
}
