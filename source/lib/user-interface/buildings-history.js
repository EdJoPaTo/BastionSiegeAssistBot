const {arrayFilterUniqueInBetween} = require('../javascript-abstraction/array')

const {calculateSecondsFromTimeframeString} = require('../math/timeframe')

const playerHistory = require('../data/player-history')

const {createPngBuffer} = require('./history-graph')

const DEFAULT_HISTORY_TIMEFRAME = '28d'

async function buildingsHistoryGraphFromContext(ctx) {
  const timeframe = ctx.session.buildingsHistoryTimeframe || DEFAULT_HISTORY_TIMEFRAME
  const timeframeInSeconds = calculateSecondsFromTimeframeString(timeframe)
  const minDate = Date.now() - (timeframeInSeconds * 1000)
  const minUnixTimestamp = minDate / 1000

  const buildingSeries = createHistorySeriesFromData(ctx, minUnixTimestamp,
    playerHistory.getAllTimestamps(ctx.from.id, 'buildings')
  )
  const workshopSeries = createHistorySeriesFromData(ctx, minUnixTimestamp,
    playerHistory.getAllTimestamps(ctx.from.id, 'workshop')
  )

  const options = {
    height: 600,
    width: 800,
    unit: ctx.i18n.t('bs.buildings'),
    labelNumberFormatter: number => String(number)
  }

  const buffer = await createPngBuffer(minUnixTimestamp, options, ...buildingSeries, ...workshopSeries)
  return buffer
}

function createHistorySeriesFromData(ctx, minTimestamp, allData) {
  const data = []
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
    .filter(o => isFinite(lastEntry.data[o]))

  const series = keys
    .map(key => ({
      labelText: ctx.i18n.t(`bs.building.${key}`),
      points: data
        .map(({timestamp, data}) => ({
          timestamp: timestamp * 1000,
          value: data[key] || 0
        }))
        .filter(arrayFilterUniqueInBetween(o => o.value))
    }))
    .filter(o => o.points.length > 2)

  return series
}

module.exports = {
  DEFAULT_HISTORY_TIMEFRAME,
  buildingsHistoryGraphFromContext
}
