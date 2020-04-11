import {AverageTimeOfDay} from '../math/unix-timestamp'
import {SumAverageAmount} from '../math/number-array'

export interface PlayerStatsLoot {
  gems: SumAverageAmount;
  loot: SumAverageAmount;
}

export interface PlayerStatsActivity {
  activeTime: AverageTimeOfDay;
  attacksWithoutLossPercentage: number;
  inactiveTime: AverageTimeOfDay;
  lastTimeObservedActive: number;
  lastTimeObservedActivityUnclear: number;
  lastTimeObservedInactive: number;
}

export interface PlayerStats extends PlayerStatsLoot, PlayerStatsActivity {
  player: string;
  playerNameLookingLike: string;
  alliance?: string;
  allAlliances: (string | undefined)[];
  battlesObserved: number;
  battlesObservedNearPast: number;
  lastBattleTime: number;
  army: number;
  terra: number;
  seemsCanned: boolean;
}
