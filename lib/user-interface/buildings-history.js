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

  const buffer = await createPngBuffer(minUnixTimestamp, ctx.i18n.t('bs.buildings'), ...buildingSeries, ...workshopSeries)
  return buffer
}

function createHistorySeriesFromData(ctx, minTimestamp, data) {
  if (data.length === 0) {
    return []
  }

  const keys = Object.keys(data[0].data)
    .filter(o => isFinite(data[0].data[o]))

  const series = keys
    .map(key => ({
      position: ctx.i18n.t(`bs.building.${key}`),
      points: data
        .map(({timestamp, data}) => ({
          timestamp: timestamp * 1000,
          value: data[key]
        }))
        .filter(o => o.timestamp > minTimestamp)
    }))

  return series
}

module.exports = {
  DEFAULT_HISTORY_TIMEFRAME,
  buildingsHistoryGraphFromContext
}
