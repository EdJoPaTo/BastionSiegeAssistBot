import {Session} from '../types'

import {arrayFilterUniqueInBetween} from '../javascript-abstraction/array'

import {calculateSecondsFromTimeframeString} from '../math/timeframe'

import * as playerHistory from '../data/player-history'

import {createPngBuffer, Options, Series} from './history-graph'

export const DEFAULT_HISTORY_TIMEFRAME = '28d'

export async function buildingsHistoryGraphFromContext(ctx: any): Promise<Buffer> {
  const session = ctx.session as Session
  const timeframe = session.buildingsHistoryTimeframe || DEFAULT_HISTORY_TIMEFRAME
  const timeframeInSeconds = calculateSecondsFromTimeframeString(timeframe)
  const minDate = Date.now() - (timeframeInSeconds * 1000)
  const minUnixTimestamp = minDate / 1000

  const buildingSeries = createHistorySeriesFromData(ctx, minUnixTimestamp,
    playerHistory.getAllTimestamps(ctx.from.id, 'buildings') as any[]
  )
  const workshopSeries = createHistorySeriesFromData(ctx, minUnixTimestamp,
    playerHistory.getAllTimestamps(ctx.from.id, 'workshop') as any[]
  )

  const options: Options = {
    height: 600,
    width: 800,
    unit: ctx.i18n.t('bs.buildings'),
    labelNumberFormatter: number => String(number)
  }

  const buffer = await createPngBuffer(minUnixTimestamp, options, ...buildingSeries, ...workshopSeries)
  return buffer
}

interface Data {
  timestamp: number;
  data: Record<string, number>;
}

function createHistorySeriesFromData(ctx: any, minTimestamp: number, allData: Data[]): Series[] {
  const data: Data[] = []
  for (let i = 0; i < allData.length; i++) {
    if (allData[i].timestamp > minTimestamp) {
      if (data.length === 0 && i > 0) {
        data.push(allData[i - 1])
      }

      data.push(allData[i])
    }
  }

  if (data.length === 0) {
    return []
  }

  const lastEntry = data.slice(-1)[0]
  const keys = Object.keys(lastEntry.data)
    .filter(o => Number.isFinite(lastEntry.data[o]))

  const series = keys
    .map(key => ({
      labelText: ctx.i18n.t(`bs.building.${key}`),
      points: data
        .map(({timestamp, data}) => ({
          timestamp: timestamp * 1000,
          value: data[key] || 0
        }))
        .filter(arrayFilterUniqueInBetween(o => String(o.value)))
    }))
    .filter(o => o.points.length > 2)

  return series
}
