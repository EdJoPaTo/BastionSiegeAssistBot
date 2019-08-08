import test, {ExecutionContext} from 'ava'

import {
  ONE_HOUR_IN_SECONDS,
  averageTimeOfDay,
  getMidnightXDaysEarlier,
  getTimeDifference,
  getTimeOfDayAsXYCoordinates
} from './unix-timestamp'

test('getTimeOfDayAsXYCoordinates examples', t => {
  getTimeOfDayAsXYCoordinatesSpecific(t, ONE_HOUR_IN_SECONDS * 0, 0, 1)
  getTimeOfDayAsXYCoordinatesSpecific(t, ONE_HOUR_IN_SECONDS * 6, 1, 0)
  getTimeOfDayAsXYCoordinatesSpecific(t, ONE_HOUR_IN_SECONDS * 12, 0, -1)
  getTimeOfDayAsXYCoordinatesSpecific(t, ONE_HOUR_IN_SECONDS * 18, -1, -0)
})

function getTimeOfDayAsXYCoordinatesSpecific(t: ExecutionContext, input: number, expectedX: number, expectedY: number): void {
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

function averageTimeOfDayOneValue(t: ExecutionContext, value: number): void {
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

test('getTimeDifference no time', timeDifferenceMacro, 0, 0, 0)
test('getTimeDifference one hour later', timeDifferenceMacro, 1, 0, 1)
test('getTimeDifference one hour earlier', timeDifferenceMacro, -1, 1, 0)
test('getTimeDifference day', timeDifferenceMacro, 2, 15, 17)
test('getTimeDifference day negative', timeDifferenceMacro, -2, 17, 15)
test('getTimeDifference night', timeDifferenceMacro, 2, 23, 1)
test('getTimeDifference night negative', timeDifferenceMacro, -2, 1, 23)
test('getTimeDifference long', timeDifferenceMacro, 11, 12, 23)
test('getTimeDifference long negative', timeDifferenceMacro, -11, 12, 1)
test('getTimeDifference 12h', timeDifferenceMacro, 12, 0, 12)

function timeDifferenceMacro(t: ExecutionContext, expected: number, baseHour: number, otherHour: number): void {
  const result = getTimeDifference(baseHour * ONE_HOUR_IN_SECONDS, otherHour * ONE_HOUR_IN_SECONDS)
  t.is(result, expected * ONE_HOUR_IN_SECONDS)
}

test('getMidnightXDaysEarlier example', t => {
  t.is(getMidnightXDaysEarlier(1542913295, 7), 1542326400)
})
