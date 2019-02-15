const Telegraf = require('telegraf')
const debounce = require('debounce-promise')

const {estimateResourcesAfterTimespan} = require('../lib/math/siegemath')

const {
  BUILDINGS,
  defaultBuildingsToShow,
  createBuildingTimeStatsString,
  createBuildingMaxLevelStatsString,
  createFillTimeStatsString
} = require('../lib/user-interface/buildings')

const DEBOUNCE_TIME = 100 // Milliseconds

const bot = new Telegraf.Composer()

function isBuildingsOrResources(ctx) {
  if (!ctx.state.screen) {
    return false
  }

  const {buildings, resources, workshop} = ctx.state.screen.information || {}
  return buildings || resources || workshop
}

const debouncedBuildStats = {}
bot.on('text', Telegraf.optional(isBuildingsOrResources, ctx => {
  const {id} = ctx.from
  if (!debouncedBuildStats[id]) {
    debouncedBuildStats[id] = debounce(sendBuildStats, DEBOUNCE_TIME)
  }

  debouncedBuildStats[id](ctx)
}))

bot.command('buildings', sendBuildStats)

function creationNotPossibleReason(ctx) {
  const information = ctx.session.gameInformation

  if (!information.buildingsTimestamp) {
    return ctx.i18n.t('buildings.need.buildings')
  }

  if (!information.resourcesTimestamp) {
    return ctx.i18n.t('buildings.need.resources')
  }

  return false
}

function creationWarnings(ctx) {
  const information = ctx.session.gameInformation
  const warnings = []

  // Unix timestamp just without seconds (/60)
  const currentTimestamp = Math.floor(Date.now() / 1000 / 60)
  const resourceAgeMinutes = currentTimestamp - Math.floor(information.resourcesTimestamp / 60)
  const buildingAgeMinutes = currentTimestamp - Math.floor(information.buildingsTimestamp / 60)

  if (resourceAgeMinutes > 30) {
    warnings.push(ctx.i18n.t('buildings.old.resources'))
  }

  if (buildingAgeMinutes > 60 * 5) {
    warnings.push(ctx.i18n.t('buildings.old.buildings'))
  }

  return warnings
}

function sendBuildStats(ctx) {
  const statsText = generateStatsText(ctx)
  return ctx.reply(statsText)
}

function generateStatsText(ctx) {
  const notPossibleReason = creationNotPossibleReason(ctx)
  if (notPossibleReason) {
    return ctx.replyWithMarkdown(notPossibleReason)
  }

  const information = ctx.session.gameInformation
  let buildingsToShow = ctx.session.buildings

  const buildings = {...information.buildings, ...information.workshop}

  const currentTimestamp = Math.floor(Date.now() / 1000 / 60)
  const resourceAgeMinutes = currentTimestamp - Math.floor(information.resourcesTimestamp / 60)
  const estimatedResources = estimateResourcesAfterTimespan(information.resources, buildings, resourceAgeMinutes)

  let text = ''

  buildingsToShow = BUILDINGS
    .filter(o => (buildingsToShow || defaultBuildingsToShow).includes(o))

  text += `*${ctx.i18n.t('buildings.title')}*\n`
  text += buildingsToShow
    .map(o => createBuildingTimeStatsString(o, buildings, estimatedResources))
    .join('\n')
  text += '\n\n'

  text += `*${ctx.i18n.t('buildings.maxPossible')}*\n`
  text += buildingsToShow
    .filter(o => o !== 'storage')
    .map(o => createBuildingMaxLevelStatsString(o, buildings, estimatedResources))
    .join('\n')
  text += '\n\n'

  text += `*${ctx.i18n.t('buildings.fillStorage')}*\n`
  text += createFillTimeStatsString(buildings, estimatedResources)
  text += '\n'

  const warnings = creationWarnings(ctx)
  text += warnings
    .map(o => '⚠️ ' + o)
    .join('\n')

  return text
}

module.exports = {
  bot
}
