import {EMOJI, Battlereport} from 'bastion-siege-logic'

import {BattleStats} from '../types'

import {getSumAverageAmount, getSumAverageAmountGroupedBy, GroupedSumAverageAmount} from './number-array'

type ValueSelector = (report: Battlereport) => number | undefined

export function generate(battlereports: readonly Battlereport[], valueSelector: ValueSelector): BattleStats {
  const battlesWithoutDragonAndUndead = battlereports
    .filter(o => !o.enemyMystic)

  return {
    reward: getSumAverageAmount(battlesWithoutDragonAndUndead.map(o => valueSelector(o))),
    rewardAttackWon: generatePerAlliance(battlesWithoutDragonAndUndead.filter(o => o.attack && o.won), valueSelector),
    rewardAttackLost: generatePerAlliance(battlesWithoutDragonAndUndead.filter(o => o.attack && !o.won), valueSelector),
    rewardDefenseWon: generatePerAlliance(battlesWithoutDragonAndUndead.filter(o => !o.attack && o.won), valueSelector),
    rewardDefenseLost: generatePerAlliance(battlesWithoutDragonAndUndead.filter(o => !o.attack && !o.won), valueSelector),
    mystics: generatePerAlliance(battlereports.filter(o => o.enemyMystic), valueSelector)
  }
}

function groupBySelector(report: Battlereport): string {
  // TODO: refactor out of math
  const {enemyAlliance, enemyMystic} = report
  if (enemyAlliance) {
    return enemyAlliance
  }

  if (enemyMystic) {
    return EMOJI[enemyMystic]
  }

  return 'undefined'
}

function generatePerAlliance(reports: readonly Battlereport[], valueSelector: ValueSelector): GroupedSumAverageAmount {
  return getSumAverageAmountGroupedBy(reports, groupBySelector, valueSelector)
}
