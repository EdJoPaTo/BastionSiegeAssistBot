import * as angleDistance from 'angle-distance'

import * as vector from './vector'

import {getStdDeviation} from './number-array'

export interface AverageTimeOfDay {
  seconds: number;
  stdDeviation: number;
  accuracy: number;
}

export const ONE_HOUR_IN_SECONDS = 60 * 60
export const ONE_DAY_IN_SECONDS = ONE_HOUR_IN_SECONDS * 24

export function getMidnightXDaysEarlier(unixTimestamp: number, daysAgo: number): number {
  const daysAgoTimestamp = unixTimestamp - (ONE_DAY_IN_SECONDS * daysAgo)
  const midnight = Math.ceil(daysAgoTimestamp / ONE_DAY_IN_SECONDS) * ONE_DAY_IN_SECONDS
  return midnight
}

export function getHoursEarlier(unixTimestamp: number, hoursAgo: number): number {
  const nHoursAgo = unixTimestamp - (ONE_HOUR_IN_SECONDS * hoursAgo)
  return nHoursAgo
}

export function getTimeOfDayAsXYCoordinates(unixTimestamp: number): vector.Vector {
  const secondsOfDay = unixTimestamp % ONE_DAY_IN_SECONDS
  const radian = secondsOfDay / ONE_DAY_IN_SECONDS * 2 * Math.PI
  const coordinates = {
    x: Math.sin(radian),
    y: Math.cos(radian)
  }
  return coordinates
}

export function getTimeDifference(baseTime: number, distantTime: number): number {
  return angleDistance.general(baseTime, distantTime, ONE_DAY_IN_SECONDS)
}

export function averageTimeOfDay(unixTimestamps: number[]): AverageTimeOfDay {
  const secondsOfDay = unixTimestamps
    .map(o => o % ONE_DAY_IN_SECONDS)
  const coordinates = secondsOfDay
    .map(o => getTimeOfDayAsXYCoordinates(o))
  const averageCoordinates = vector.average(coordinates)

  const radian = Math.atan2(averageCoordinates.y, averageCoordinates.x)

  // Bring the x y way to the 'clockwise' way if thinking
  const tmp = (radian - (Math.PI / 2)) * -1
  const seconds = tmp / (2 * Math.PI) * ONE_DAY_IN_SECONDS
  const seconds2 = (seconds + ONE_DAY_IN_SECONDS) % ONE_DAY_IN_SECONDS

  const accuracy = vector.length(averageCoordinates)
  const stdDeviation = getStdDeviation(secondsOfDay, seconds2, getTimeDifference)

  return {
    seconds: seconds2,
    stdDeviation,
    accuracy
  }
}

export function filterMaxDays<T>(days: number, unixTimestampSelector: (o: T) => number, now = Date.now() / 1000): (o: T) => boolean {
  const minTimestamp = getMidnightXDaysEarlier(now, days)
  return o => unixTimestampSelector(o) > minTimestamp
}
