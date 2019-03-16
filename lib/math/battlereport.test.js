import test from 'ava'

import {
  sameBattleResourceAssumption,
  uniqueBattlereportIdentifier
} from './battlereport'

test('sameBattleResourceAssumption example', t => {
  const basicReport = {
    friends: ['A', 'B', 'C', 'D']
  }

  const reports = [
    {...basicReport, gold: 2000, terra: 10},
    {...basicReport, gold: 4000, terra: 30}
  ]

  t.is(sameBattleResourceAssumption(reports), 3000 * 4)
  t.is(sameBattleResourceAssumption(reports, 'terra'), 20 * 4)
})

test('uniqueBattlereportIdentifier still same battle with seconds between reports', t => {
  const basicReport = {
    friends: ['A'],
    enemies: ['B']
  }

  const reports = [
    {...basicReport, time: 2},
    {...basicReport, time: 3}
  ]

  t.is(uniqueBattlereportIdentifier(reports[0]), uniqueBattlereportIdentifier(reports[1]))
})
