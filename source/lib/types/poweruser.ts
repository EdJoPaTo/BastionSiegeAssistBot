export type PoweruserConditionType = 'battlereports' | 'buildings' | 'name' | 'workshop'

export interface PoweruserCondition {
  type: PoweruserConditionType;
  required: boolean;
  status: boolean;
  warning: boolean;
}
