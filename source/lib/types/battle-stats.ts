import {SumAverageAmount, GroupedSumAverageAmount} from '../math/number-array'

export interface BattleStats {
  readonly reward: SumAverageAmount;
  readonly rewardAttackWon: GroupedSumAverageAmount;
  readonly rewardAttackLost: GroupedSumAverageAmount;
  readonly rewardDefenseWon: GroupedSumAverageAmount;
  readonly rewardDefenseLost: GroupedSumAverageAmount;
  readonly mystics: GroupedSumAverageAmount;
}
