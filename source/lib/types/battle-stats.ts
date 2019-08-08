import {SumAverageAmount, GroupedSumAverageAmount} from '../math/number-array'

export interface BattleStats {
  reward: SumAverageAmount;
  rewardAttackWon: GroupedSumAverageAmount;
  rewardAttackLost: GroupedSumAverageAmount;
  rewardDefenseWon: GroupedSumAverageAmount;
  rewardDefenseLost: GroupedSumAverageAmount;
  mystics: GroupedSumAverageAmount;
}
