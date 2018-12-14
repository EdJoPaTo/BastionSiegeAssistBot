import test from 'ava'

const {
  ONE_HOUR_IN_SECONDS,
  getTimeOfDayAsXYCoordinates,
  averageTimeOfDay,
  getMidnightXDaysEarlier
} = require('./unix-timestamp')

test('getTimeOfDayAsXYCoordinates examples', t => {
  getTimeOfDayAsXYCoordinatesSpecific(t, ONE_HOUR_IN_SECONDS * 0, 0, 1)
  getTimeOfDayAsXYCoordinatesSpecific(t, ONE_HOUR_IN_SECONDS * 6, 1, 0)
  getTimeOfDayAsXYCoordinatesSpecific(t, ONE_HOUR_IN_SECONDS * 12, 0, -1)
  getTimeOfDayAsXYCoordinatesSpecific(t, ONE_HOUR_IN_SECONDS * 18, -1, -0)
})

function getTimeOfDayAsXYCoordinatesSpecific(t, input, expectedX, expectedY) {
  const result = getTimeOfDayAsXYCoordinates(input)
  t.is(Math.round(result.x * 100) / 100, expectedX)
  t.is(Math.round(result.y * 100) / 100, expectedY)
}

test('averageTimeOfDay one value examples', t => {
  averageTimeOfDayOneValue(t, ONE_HOUR_IN_SECONDS * 0)
  averageTimeOfDayOneValue(t, ONE_HOUR_IN_SECONDS * 2)
  averageTimeOfDayOneValue(t, ONE_HOUR_IN_SECONDS * 3)
  averageTimeOfDayOneValue(t, ONE_HOUR_IN_SECONDS * 4)
  averageTimeOfDayOneValue(t, ONE_HOUR_IN_SECONDS * 5)
  averageTimeOfDayOneValue(t, ONE_HOUR_IN_SECONDS * 6)
  averageTimeOfDayOneValue(t, ONE_HOUR_IN_SECONDS * 12)
  averageTimeOfDayOneValue(t, ONE_HOUR_IN_SECONDS * 18)
})

function averageTimeOfDayOneValue(t, value) {
  const {seconds, stdDeviation, accuracy} = averageTimeOfDay([value])
  t.is(seconds, value)
  t.is(accuracy, 1)
  t.is(stdDeviation, 0)
}

test('averageTimeOfDay average seconds', t => {
  const {seconds} = averageTimeOfDay([
    ONE_HOUR_IN_SECONDS * 2,
    ONE_HOUR_IN_SECONDS * 4
  ])
  t.is(seconds, ONE_HOUR_IN_SECONDS * 3, 'Average of 2 and 4 o clock should be 3 o clock')
})

test('averageTimeOfDay accuracy', t => {
  // One value -> perfect
  t.is(averageTimeOfDay([0]).accuracy, 1)

  // Two values near to each other are accurate
  t.true(averageTimeOfDay([
    ONE_HOUR_IN_SECONDS * 2,
    ONE_HOUR_IN_SECONDS * 4
  ]).accuracy > 0.8)

  // Two extremes are not accurate
  t.true(averageTimeOfDay([
    ONE_HOUR_IN_SECONDS * 6,
    ONE_HOUR_IN_SECONDS * 18
  ]).accuracy < 0.3)
})

test('averageTimeOfDay stdDeviation', t => {
  // 2 and 4 are each 1 hour apart from avg
  const {stdDeviation} = averageTimeOfDay([
    ONE_HOUR_IN_SECONDS * 2,
    ONE_HOUR_IN_SECONDS * 4
  ])
  t.is(stdDeviation, ONE_HOUR_IN_SECONDS)
})

test('getMidnightXDaysEarlier example', t => {
  t.is(getMidnightXDaysEarlier(1542913295, 7), 1542326400)
})
