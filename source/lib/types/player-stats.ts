import {AverageTimeOfDay} from '../math/unix-timestamp'
import {SumAverageAmount} from '../math/number-array'

export interface PlayerStatsLoot {
  readonly gems: SumAverageAmount;
  readonly loot: SumAverageAmount;
}

export interface PlayerStatsActivity {
  readonly activeTime: AverageTimeOfDay;
  readonly attacksWithoutLossPercentage: number;
  readonly inactiveTime: AverageTimeOfDay;
  readonly lastTimeObservedActive: number;
  readonly lastTimeObservedActivityUnclear: number;
  readonly lastTimeObservedInactive: number;
}

export interface PlayerStats extends PlayerStatsLoot, PlayerStatsActivity {
  readonly player: string;
  readonly playerNameLookingLike: string;
  readonly alliance?: string;
  readonly allAlliances: ReadonlyArray<string | undefined>;
  readonly battlesObserved: number;
  readonly battlesObservedNearPast: number;
  readonly lastBattleTime: number;
  readonly army: number;
  readonly terra: number;
  readonly seemsCanned: boolean;
}
