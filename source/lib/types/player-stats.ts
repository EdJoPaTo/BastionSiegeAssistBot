import {AverageTimeOfDay} from '../math/unix-timestamp'
import {SumAverageAmount} from '../math/number-array'

export interface ArmyEstimate {
  estimate: number;
  min?: number;
  max?: number;
}

export interface PlayerStatsLoot {
  gems: SumAverageAmount;
  loot: SumAverageAmount;
  lootActive: SumAverageAmount;
  lootInactive: SumAverageAmount;
}

export interface PlayerStatsActivity {
  activeTime: AverageTimeOfDay;
  attacksWithoutLossPercentage: number;
  inactiveTime: AverageTimeOfDay;
}

export interface PlayerStats extends PlayerStatsLoot, PlayerStatsActivity {
  player: string;
  playerNameLookingLike: string;
  alliance?: string;
  allAlliances: (string | undefined)[];
  battlesObserved: number;
  battlesObservedNearPast: number;
  winsObserved: number;
  lossesObserved: number;
  lastBattleTime: number;
  army: ArmyEstimate;
  terra: number;
}
