import {Battlereport} from 'bastion-siege-logic'
import test from 'ava'

import {
  generate,
  assumeArmy
} from './player-stats'

const testNow = 1000000000
const testReports: Battlereport[] = [
  {
    attack: false,
    enemies: ['A'],
    friends: ['me'],
    me: 'me',
    gold: -100,
    soldiersAlive: 0,
    soldiersTotal: 1000,
    terra: -50,
    time: 1000000000,
    won: false
  }, {
    attack: true,
    enemies: ['A'],
    friends: ['me'],
    me: 'me',
    gold: 1000,
    soldiersAlive: 1000,
    soldiersTotal: 2000,
    terra: 50,
    time: 1000000010,
    won: true
  }, {
    attack: true,
    enemies: ['A', 'B'],
    friends: ['me'],
    me: 'me',
    gold: 2000,
    soldiersAlive: 1500,
    soldiersTotal: 3000,
    terra: 50,
    time: 1000000020,
    won: true
  }, {
    attack: false,
    enemies: ['A', 'B'],
    friends: ['me', 'me2'],
    me: 'me',
    gold: 1000,
    soldiersAlive: 50,
    soldiersTotal: 100,
    terra: 50,
    time: 1000000030,
    won: true
  }, {
    attack: true,
    enemies: ['B'],
    friends: ['me'],
    me: 'me',
    gold: 2000,
    soldiersAlive: 2500,
    soldiersTotal: 5000,
    terra: 50,
    time: 1000000040,
    won: true
  }
]

test('generate example A', t => {
  const resultA = generate(testReports, 'A', testNow)
  t.deepEqual(resultA, {
    player: 'A',
    playerNameLookingLike: 'A',
    alliance: undefined,
    allAlliances: [undefined],
    lastBattleTime: 1000000030,
    lastTimeObservedActive: 1000000030,
    lastTimeObservedActivityUnclear: 1000000020,
    lastTimeObservedInactive: -Infinity,
    activeTime: {
      seconds: 6415,
      stdDeviation: 15,
      accuracy: 0.9999994050441611
    },
    army: 1000,
    terra: 950,
    attacksWithoutLossPercentage: 0,
    inactiveTime: {
      accuracy: Number.NaN,
      seconds: Number.NaN,
      stdDeviation: Number.NaN
    },
    seemsCanned: false,
    loot: {
      amount: 1,
      avg: 1000,
      min: 1000,
      max: 1000,
      sum: 1000
    },
    gems: {
      amount: 0,
      avg: Number.NaN,
      min: Infinity,
      max: -Infinity,
      sum: 0
    },
    battlesObserved: 4,
    battlesObservedNearPast: 4
  })
})

test('generate example B', t => {
  const resultB = generate(testReports, 'B', testNow)
  t.deepEqual(resultB, {
    player: 'B',
    playerNameLookingLike: 'B',
    alliance: undefined,
    allAlliances: [undefined],
    lastBattleTime: 1000000040,
    lastTimeObservedActive: 1000000030,
    lastTimeObservedActivityUnclear: 1000000040,
    lastTimeObservedInactive: -Infinity,
    activeTime: {
      seconds: 6425,
      stdDeviation: 5,
      accuracy: 0.9999999338937899
    },
    army: 2500,
    terra: 950,
    attacksWithoutLossPercentage: 0,
    inactiveTime: {
      accuracy: Number.NaN,
      seconds: Number.NaN,
      stdDeviation: Number.NaN
    },
    seemsCanned: false,
    loot: {
      amount: 1,
      avg: 2000,
      min: 2000,
      max: 2000,
      sum: 2000
    },
    gems: {
      amount: 0,
      avg: Number.NaN,
      min: Infinity,
      max: -Infinity,
      sum: 0
    },
    battlesObserved: 3,
    battlesObservedNearPast: 3
  })
})

test('alliance attack alone lost is ignored', t => {
  const reports: Battlereport[] = [...testReports, {
    attack: true,
    enemies: [
      'A',
      'B'
    ],
    friends: [
      'me'
    ],
    me: 'me',
    gold: 100,
    soldiersAlive: 0,
    soldiersTotal: 1500,
    terra: 50,
    time: 1000000100,
    won: false
  }]

  const result = generate(reports, 'A', testNow)
  t.not(result.army, 1500, 'the lost alliance attack should not be considered')
})

test('lost attacks are not considered for loot', t => {
  const reports: Battlereport[] = [{
    attack: true,
    enemies: [
      'A'
    ],
    friends: [
      'me'
    ],
    me: 'me',
    gold: -100,
    soldiersAlive: 0,
    soldiersTotal: 1500,
    terra: 50,
    time: 1000000020,
    won: false
  }]

  const result = generate(reports, 'A', testNow)
  t.is(result.loot.amount, 0)
})

test('old reports are not considered for loot', t => {
  const reports: Battlereport[] = [{
    attack: true,
    enemies: [
      'A'
    ],
    friends: [
      'me'
    ],
    me: 'me',
    gold: 1000000,
    soldiersAlive: 1000,
    soldiersTotal: 1500,
    terra: 50,
    time: 0,
    won: true
  }]

  const result = generate(reports, 'A', testNow)
  t.is(result.loot.amount, 0)
})

test('alliance attack against solo target is considered for loot', t => {
  const reports: Battlereport[] = [...testReports, {
    attack: true,
    enemies: [
      'A'
    ],
    friends: [
      'me',
      'me2'
    ],
    me: 'me',
    gold: 7000000,
    soldiersAlive: 0,
    soldiersTotal: 100,
    terra: 50,
    time: 1000000100,
    won: true
  }]

  const result = generate(reports, 'A', testNow)
  // Two attackers got 7M each -> 14M
  t.is(result.loot.max, 14000000)
})

test('two alliance repotts at the same time are counted only once for loot', t => {
  const report: Battlereport = {
    attack: true,
    enemies: [
      'A'
    ],
    friends: [
      'me',
      'me2'
    ],
    me: 'me',
    gold: 7000000,
    soldiersAlive: 0,
    soldiersTotal: 100,
    terra: 50,
    time: 1000000020,
    won: true
  }
  const reports = [
    {...report},
    {...report}
  ]

  const result = generate(reports, 'A', testNow)
  t.is(result.loot.amount, 1)
})

test('assumeArmy basic example', t => {
  // This ignores attack or defences and players in there, every report is looked at that is given
  const result = assumeArmy(testReports)
  t.is(result, 2500)
})

test('assume Army based on gold lost', t => {
  const reports: Battlereport[] = [{
    attack: false,
    enemies: [
      'A'
    ],
    friends: [
      'me'
    ],
    me: 'me',
    gold: -700000,
    soldiersAlive: 0,
    soldiersTotal: 0,
    terra: -50,
    time: 1000000050,
    won: false
  }]

  const result = assumeArmy(reports)
  t.is(result, 1400)
})
