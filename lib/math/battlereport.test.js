import test from 'ava'

import {
  uniqueBattlereportIdentifier
} from './battlereport'

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
