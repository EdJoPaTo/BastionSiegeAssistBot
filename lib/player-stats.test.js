import test from 'ava'

const {
  generate,
  assumeArmy
} = require('./player-stats')

const testReports = [
  {
    attack: false,
    enemies: ['A'],
    friends: ['me'],
    reward: -100,
    soldiersAlive: 0,
    soldiersTotal: 1000,
    terra: -50,
    time: 1000000000,
    won: false
  }, {
    attack: true,
    enemies: ['A'],
    friends: ['me'],
    reward: 1000,
    soldiersAlive: 1000,
    soldiersTotal: 2000,
    terra: 50,
    time: 1000000010,
    won: true
  }, {
    attack: true,
    enemies: ['A', 'B'],
    friends: ['me'],
    reward: 2000,
    soldiersAlive: 1500,
    soldiersTotal: 3000,
    terra: 50,
    time: 1000000020,
    won: true
  }, {
    attack: false,
    enemies: ['A', 'B'],
    friends: ['me', 'me2'],
    reward: 1000,
    soldiersAlive: 50,
    soldiersTotal: 100,
    terra: 50,
    time: 1000000030,
    won: true
  }, {
    attack: true,
    enemies: ['B'],
    friends: ['me'],
    reward: 2000,
    soldiersAlive: 2500,
    soldiersTotal: 5000,
    terra: 50,
    time: 1000000040,
    won: true
  }
]

test('generate example', t => {
  const resultA = generate(testReports, 'A')
  const resultB = generate(testReports, 'B')
  t.deepEqual(resultA, {
    player: 'A',
    immune: false,
    armyAttack: {
      max: 2000,
      maxPercentLost: 0.5,
      maxtime: 1000000010
    },
    armyDefense: {
      min: 1000
    },
    attacksWithoutLossPercentage: 0,
    loot: {
      amount: 1,
      avg: 1000,
      min: 1000,
      max: 1000,
      sum: 1000
    },
    gems: {
      amount: 0,
      avg: NaN,
      min: Infinity,
      max: -Infinity,
      sum: 0
    },
    battlesObserved: 2,
    winsObserved: 1,
    lossesObserved: 1
  })

  t.deepEqual(resultB, {
    player: 'B',
    immune: false,
    armyAttack: {
      max: 5000,
      maxPercentLost: 0.5,
      maxtime: 1000000040
    },
    armyDefense: {},
    attacksWithoutLossPercentage: 0,
    loot: {
      amount: 1,
      avg: 2000,
      min: 2000,
      max: 2000,
      sum: 2000
    },
    gems: {
      amount: 0,
      avg: NaN,
      min: Infinity,
      max: -Infinity,
      sum: 0
    },
    battlesObserved: 1,
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
    reward: 100,
    soldiersAlive: 0,
    soldiersTotal: 1500,
    terra: 50,
    time: 1000000020,
    won: false
  }]

  const result = generate(reports, 'A')
  t.not(result.armyAttack.max, 1500, 'the lost alliance attack should not be considered')
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
    reward: 100,
    soldiersAlive: 750,
    soldiersTotal: 1500,
    terra: 50,
    time: 1000000020,
    won: true
  }]

  const result = generate(reports, 'A')
  /*
  // When this is implemented this should be the result
  t.deepEqual(result.armyAttack, {
    min: 1000,
    max: 1500,
    maxPercentLost: 0.5,
    maxtime: 1000000020
  })
  */
  t.not(result.armyAttack.max, 1500)
})

test('assumeArmy basic example', t => {
  // This ignores attack or defences and players in there, every report is looked at that is given
  const result = assumeArmy(testReports)
  t.deepEqual(result, {
    min: 1000,
    max: 2000,
    maxPercentLost: 0.5,
    maxtime: 1000000010
  })
})
