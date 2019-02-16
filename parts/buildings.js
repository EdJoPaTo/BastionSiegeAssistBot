const debounce = require('debounce-promise')
const Telegraf = require('telegraf')
const TelegrafInlineMenu = require('telegraf-inline-menu')

const {toggleInArray} = require('../lib/javascript-abstraction/array')

const {
  calcMaxBuildingLevel,
  estimateResourcesAfterTimespan
} = require('../lib/math/siegemath')

const {emoji} = require('../lib/user-interface/output-text')
const {
  BUILDINGS,
  getBuildingText,
  defaultBuildingsToShow,
  createBuildingCostPerWinChanceLine,
  createBuildingTimeStatsString,
  createBuildingMaxLevelStatsString,
  createFillTimeStatsString
} = require('../lib/user-interface/buildings')

const DEBOUNCE_TIME = 100 // Milliseconds

const VIEWS = [
  'upgrades',
  'fillStorage',
  'winChances'
]
const DEFAULT_VIEW = VIEWS[0]

const WIN_CHANCE_INFLUENCERS = ['barracks', 'trebuchet', 'wall']

const bot = new Telegraf.Composer()

function isBuildingsOrResources(ctx) {
  if (!ctx.state.screen) {
    return false
  }

  const {buildings, resources, workshop} = ctx.state.screen.information || {}
  return buildings || resources || workshop
}

const menu = new TelegrafInlineMenu(generateStatsText)
  .setCommand('buildings')

const replyMenuMiddleware = menu.replyMenuMiddleware().middleware()

const debouncedBuildStats = {}
bot.on('text', Telegraf.optional(isBuildingsOrResources, ctx => {
  const {id} = ctx.from
  if (!debouncedBuildStats[id]) {
    debouncedBuildStats[id] = debounce(replyMenuMiddleware, DEBOUNCE_TIME)
  }

  debouncedBuildStats[id](ctx)
}))

menu.submenu(ctx => emoji.houses + ' ' + ctx.i18n.t('bs.buildings'), 'buildings', new TelegrafInlineMenu(ctx => ctx.i18n.t('setting.buildings.infotext')), {
  hide: ctx => (ctx.session.buildingsView || DEFAULT_VIEW) !== 'upgrades'
})
  .select('b', BUILDINGS, {
    multiselect: true,
    columns: 2,
    textFunc: getBuildingText,
    setFunc: (ctx, key) => {
      ctx.session.buildings = toggleInArray(ctx.session.buildings || [...defaultBuildingsToShow], key)
    },
    isSetFunc: (ctx, key) => (ctx.session.buildings || [...defaultBuildingsToShow]).includes(key)
  })

menu.select('view', VIEWS, {
  columns: 2,
  hide: ctx => creationNotPossibleReason(ctx) !== false,
  textFunc: (ctx, key) => ctx.i18n.t('buildings.' + key),
  isSetFunc: (ctx, key) => (ctx.session.buildingsView || DEFAULT_VIEW) === key,
  setFunc: (ctx, key) => {
    ctx.session.buildingsView = key
  }
})

bot.use(menu.init({
  backButtonText: ctx => `🔙 ${ctx.i18n.t('menu.back')}…`,
  actionCode: 'buildings'
}))

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

function generateStatsText(ctx) {
  const notPossibleReason = creationNotPossibleReason(ctx)
  if (notPossibleReason) {
    return notPossibleReason
  }

  const information = ctx.session.gameInformation
  const buildings = {...information.buildings, ...information.workshop}

  const currentTimestamp = Math.floor(Date.now() / 1000 / 60)
  const resourceAgeMinutes = currentTimestamp - Math.floor(information.resourcesTimestamp / 60)
  const estimatedResources = estimateResourcesAfterTimespan(information.resources, buildings, resourceAgeMinutes)

  let text = ''

  const selectedView = ctx.session.buildingsView || DEFAULT_VIEW
  if (selectedView === 'upgrades') {
    const buildingsToShow = BUILDINGS
      .filter(o => (ctx.session.buildings || defaultBuildingsToShow).includes(o))

    text += `*${ctx.i18n.t('buildings.upgrades')}*\n`
    text += buildingsToShow
      .map(o => createBuildingTimeStatsString(o, buildings, estimatedResources))
      .join('\n')

    const upgradeable = buildingsToShow
      .filter(o => o !== 'storage')
      .filter(o => calcMaxBuildingLevel(o, buildings) > buildings[o])

    if (upgradeable.length > 0) {
      text += '\n\n'
      text += `*${ctx.i18n.t('buildings.maxPossible')}*\n`
      text += upgradeable
        .map(o => createBuildingMaxLevelStatsString(o, buildings, estimatedResources))
        .join('\n')
    }
  } else if (selectedView === 'fillStorage') {
    text += `*${ctx.i18n.t('buildings.fillStorage')}*\n`
    text += createFillTimeStatsString(buildings, estimatedResources)
  } else if (selectedView === 'winChances') {
    text += `*${ctx.i18n.t('buildings.winChances')}*\n`
    text += ctx.i18n.t('buildings.winChance.info')

    text += '\n'
    text += `*${ctx.i18n.t('buildings.winChance.solo')}*\n`
    text += WIN_CHANCE_INFLUENCERS
      .map(building =>
        createBuildingCostPerWinChanceLine('solo', building, buildings[building])
      )
      .join('\n')

    text += '\n\n'
    text += `*${ctx.i18n.t('buildings.winChance.alliance')}*\n`
    text += WIN_CHANCE_INFLUENCERS
      .map(building =>
        createBuildingCostPerWinChanceLine('alliance', building, buildings[building])
      )
      .join('\n')
  }

  text += '\n\n'

  const warnings = creationWarnings(ctx)
  text += warnings
    .map(o => '⚠️ ' + o)
    .join('\n')

  return text
}

module.exports = {
  bot
}
