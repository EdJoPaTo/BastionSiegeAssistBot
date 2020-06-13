export type PoweruserConditionType = 'battlereports' | 'buildings' | 'name' | 'workshop'

export interface PoweruserCondition {
  readonly type: PoweruserConditionType;
  readonly required: boolean;
  readonly status: boolean;
  readonly warning: boolean;
}
