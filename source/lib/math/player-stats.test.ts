import test from 'ava'

import {
  generate,
  assumeArmy
} from './player-stats'

const testNow = 1000000000
const testReports = [
  {
    attack: false,
    enemies: ['A'],
    friends: ['me'],
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
    gold: 2000,
    soldiersAlive: 2500,
    soldiersTotal: 5000,
    terra: 50,
    time: 1000000040,
    won: true
  }
]

test('generate example', t => {
  const resultA = generate(testReports, 'A', testNow)
  const resultB = generate(testReports, 'B', testNow)
  t.deepEqual(resultA, {
    player: 'A',
    alliance: undefined,
    allAlliances: [undefined],
    lastBattleTime: 1000000030,
    activeTime: {
      seconds: 6415,
      stdDeviation: 15,
      accuracy: 0.9999994050441611
    },
    army: {
      estimate: 1500,
      min: 1000,
      max: 2000
    },
    terra: 950,
    attacksWithoutLossPercentage: 0,
    inactiveTime: {
      accuracy: NaN,
      seconds: NaN,
      stdDeviation: NaN
    },
    loot: {
      amount: 1,
      avg: 1000,
      min: 1000,
      max: 1000,
      stdDeviation: 0,
      sum: 1000
    },
    lootActive: {
      amount: 1,
      avg: 1000,
      min: 1000,
      max: 1000,
      stdDeviation: 0,
      sum: 1000
    },
    lootInactive: {
      amount: 0,
      avg: NaN,
      min: Infinity,
      max: -Infinity,
      stdDeviation: NaN,
      sum: 0
    },
    gems: {
      amount: 0,
      avg: NaN,
      min: Infinity,
      max: -Infinity,
      stdDeviation: NaN,
      sum: 0
    },
    battlesObserved: 4,
    battlesObservedNearPast: 4,
    winsObserved: 1,
    lossesObserved: 1
  })

  t.deepEqual(resultB, {
    player: 'B',
    alliance: undefined,
    allAlliances: [undefined],
    lastBattleTime: 1000000040,
    activeTime: {
      seconds: 6425,
      stdDeviation: 5,
      accuracy: 0.9999999338937899
    },
    army: {
      estimate: 3750,
      min: 2500,
      max: 5000
    },
    terra: 950,
    attacksWithoutLossPercentage: 0,
    inactiveTime: {
      accuracy: NaN,
      seconds: NaN,
      stdDeviation: NaN
    },
    loot: {
      amount: 1,
      avg: 2000,
      min: 2000,
      max: 2000,
      stdDeviation: 0,
      sum: 2000
    },
    lootActive: {
      amount: 1,
      avg: 2000,
      min: 2000,
      max: 2000,
      stdDeviation: 0,
      sum: 2000
    },
    lootInactive: {
      amount: 0,
      avg: NaN,
      min: Infinity,
      max: -Infinity,
      stdDeviation: NaN,
      sum: 0
    },
    gems: {
      amount: 0,
      avg: NaN,
      min: Infinity,
      max: -Infinity,
      stdDeviation: NaN,
      sum: 0
    },
    battlesObserved: 3,
    battlesObservedNearPast: 3,
    winsObserved: 1,
    lossesObserved: 0
  })
})

test('alliance attack alone lost is ignored', t => {
  const reports = [...testReports, {
    attack: true,
    enemies: [
      'A',
      'B'
    ],
    friends: [
      'me'
    ],
    gold: 100,
    soldiersAlive: 0,
    soldiersTotal: 1500,
    terra: 50,
    time: 1000000100,
    won: false
  }]

  const result = generate(reports, 'A', testNow)
  t.not(result.army.max, 1500, 'the lost alliance attack should not be considered')
})

test('lost attacks are not considered for loot', t => {
  const reports = [{
    attack: true,
    enemies: [
      'A'
    ],
    friends: [
      'me'
    ],
    gold: -100,
    soldiersAlive: 0,
    soldiersTotal: 1500,
    terra: 50,
    time: 1000000020,
    won: false
  }]

  const result = generate(reports, 'A', testNow)
  t.deepEqual(result.loot.amount, 0)
})

test('old reports are not considered for loot', t => {
  const reports = [{
    attack: true,
    enemies: [
      'A'
    ],
    friends: [
      'me'
    ],
    gold: 1000000,
    soldiersAlive: 1000,
    soldiersTotal: 1500,
    terra: 50,
    time: 0,
    won: true
  }]

  const result = generate(reports, 'A', testNow)
  t.deepEqual(result.loot.amount, 0)
})

test('alliance attack against solo target is considered for loot', t => {
  const reports = [...testReports, {
    attack: true,
    enemies: [
      'A'
    ],
    friends: [
      'me',
      'me2'
    ],
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
  const report = {
    attack: true,
    enemies: [
      'A'
    ],
    friends: [
      'me',
      'me2'
    ],
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

test('alliance attack alone won', t => {
  // This is an idea to consider but it is not implemented
  const reports = [...testReports, {
    attack: true,
    enemies: [
      'A',
      'B'
    ],
    friends: [
      'me'
    ],
    gold: 100,
    soldiersAlive: 750,
    soldiersTotal: 1500,
    terra: 50,
    time: 1000000100,
    won: true
  }]

  const result = generate(reports, 'A', testNow)
  /*
  // When this is implemented this should be the result
  t.deepEqual(result.army, {
    min: 1000,
    max: 1500
  })
  */
  t.not(result.army.max, 1500)
})

test('assumeArmy basic example', t => {
  // This ignores attack or defences and players in there, every report is looked at that is given
  const result = assumeArmy(testReports)
  t.deepEqual(result, {
    estimate: 2750,
    min: 2500,
    max: 3000
  })
})

test('assume Army based on gold lost', t => {
  const reports = [{
    attack: false,
    enemies: [
      'A'
    ],
    friends: [
      'me'
    ],
    gold: -700000,
    soldiersAlive: 0,
    soldiersTotal: 0,
    terra: -50,
    time: 1000000050,
    won: false
  }]

  const result = assumeArmy(reports)
  t.deepEqual(result, {
    estimate: 1400,
    min: 1400
  })
})
