import {Composer} from 'telegraf'
import {CONSTRUCTIONS, calcMaxBuildingLevel, estimateResourcesAfter, BattleBuilding} from 'bastion-siege-logic'
import {MenuTemplate, MenuMiddleware, Body} from 'telegraf-inline-menu'

import {ContextAwareDebounce} from '../lib/javascript-abstraction/context-aware-debounce'

import {Context, BUILDING_VIEWS, BuildingView} from '../lib/types'

import {calculateSecondsFromTimeframeString} from '../lib/math/timeframe'

import {whenScreenContainsInformation} from '../lib/input/gamescreen'

import {DEFAULT_HISTORY_TIMEFRAME, buildingsHistoryGraphFromContext} from '../lib/user-interface/buildings-history'
import {emoji} from '../lib/user-interface/output-text'
import {
  createBuildingCostPerWinChanceLine,
  createBuildingMaxLevelStatsString,
  createBuildingTimeStatsString,
  createCapacityStatsString,
  createFillTimeStatsString,
  createIncomeStatsString,
  defaultBuildingsToShow
} from '../lib/user-interface/buildings'

import * as buildingsMenu from './settings/buildings'

const DEBOUNCE_TIME = 200 // Milliseconds

const DEFAULT_VIEW = BUILDING_VIEWS[0]

const WIN_CHANCE_INFLUENCERS: BattleBuilding[] = ['barracks', 'trebuchet', 'wall']

async function menuBody(ctx: Context): Promise<Body> {
  const photo = await generateStatsPhoto(ctx)
  const text = generateStatsText(ctx)

  if (photo) {
    return {
      media: photo,
      type: 'photo',
      text,
      parse_mode: 'Markdown'
    }
  }

  return {text, parse_mode: 'Markdown'}
}

const menu = new MenuTemplate<Context>(menuBody)

menu.submenu(ctx => `${emoji.houses} ${ctx.i18n.t('bs.buildings')}`, 'buildings', buildingsMenu.menu, {
  hide: ctx => (ctx.session.buildingsView || DEFAULT_VIEW) !== 'upgrades'
})

menu.select('t', ['1 min', '15 min', '30 min', '1h', '6h', '12h', '1d', '2d', '7d', '30d'], {
  columns: 5,
  set: (ctx, key) => {
    ctx.session.buildingsTimeframe = key
    return true
  },
  isSet: (ctx, key) => key === (ctx.session.buildingsTimeframe || '1 min'),
  hide: ctx => (ctx.session.buildingsView || DEFAULT_VIEW) !== 'income'
})

menu.select('historyT', ['7d', '14d', '28d', '90d'], {
  hide: ctx => (ctx.session.buildingsView || DEFAULT_VIEW) !== 'history',
  isSet: (ctx, key) => key === (ctx.session.buildingsHistoryTimeframe || DEFAULT_HISTORY_TIMEFRAME),
  set: (ctx, key) => {
    ctx.session.buildingsHistoryTimeframe = key
    return true
  }
})

menu.select('view', BUILDING_VIEWS, {
  columns: 2,
  hide: ctx => creationNotPossibleReason(ctx) !== false,
  buttonText: (ctx, key) => ctx.i18n.t('buildings.' + key),
  isSet: (ctx, key) => (ctx.session.buildingsView || DEFAULT_VIEW) === key,
  set: (ctx, key) => {
    ctx.session.buildingsView = key as BuildingView
    return true
  }
})

function creationNotPossibleReason(ctx: Context): string | false {
  const information = ctx.session.gameInformation

  if (!information.buildingsTimestamp) {
    return ctx.i18n.t('buildings.need.buildings')
  }

  if (!information.resourcesTimestamp) {
    return ctx.i18n.t('buildings.need.resources')
  }

  return false
}

function creationWarnings(ctx: Context): string[] {
  const information = ctx.session.gameInformation
  const warnings: string[] = []

  // Unix timestamp just without seconds (/60)
  const currentTimestamp = Math.floor(Date.now() / 1000 / 60)
  const resourceAgeMinutes = currentTimestamp - Math.floor(information.resourcesTimestamp! / 60)
  const buildingAgeMinutes = currentTimestamp - Math.floor(information.buildingsTimestamp! / 60)

  if (resourceAgeMinutes > 30) {
    warnings.push(ctx.i18n.t('buildings.old.resources'))
  }

  if (buildingAgeMinutes > 60 * 5) {
    warnings.push(ctx.i18n.t('buildings.old.buildings'))
  }

  return warnings
}

async function generateStatsPhoto(ctx: Context): Promise<undefined | {source: Buffer}> {
  if (creationNotPossibleReason(ctx)) {
    return undefined
  }

  const selectedView = ctx.session.buildingsView || DEFAULT_VIEW
  if (selectedView === 'history') {
    const buffer = await buildingsHistoryGraphFromContext(ctx)
    return {source: buffer}
  }

  return undefined
}

function generateStatsText(ctx: Context): string {
  const notPossibleReason = creationNotPossibleReason(ctx)
  if (notPossibleReason) {
    return notPossibleReason
  }

  const information = ctx.session.gameInformation
  const buildings = {...information.buildings!, ...information.workshop!}

  const currentTimestamp = Math.floor(Date.now() / 1000 / 60)
  const resourceAgeMinutes = currentTimestamp - Math.floor(information.resourcesTimestamp! / 60)
  const estimatedResources = estimateResourcesAfter(information.resources!, buildings, resourceAgeMinutes)

  let text = ''

  const selectedView = ctx.session.buildingsView || DEFAULT_VIEW
  if (selectedView === 'upgrades') {
    const buildingsToShow = CONSTRUCTIONS
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
    text += createFillTimeStatsString(buildings, estimatedResources).trim()
  } else if (selectedView === 'income') {
    text += `*${ctx.i18n.t('buildings.capacity')}*\n`
    text += createCapacityStatsString(buildings).trim()
    text += '\n\n'

    const timeframe = ctx.session.buildingsTimeframe || '1 min'
    const seconds = calculateSecondsFromTimeframeString(timeframe)
    const minutes = seconds / 60

    text += `*${ctx.i18n.t('buildings.income')}* (${timeframe})\n`
    text += createIncomeStatsString(buildings, minutes).trim()
  } else if (selectedView === 'winChances') {
    text += `*${ctx.i18n.t('buildings.winChances')}*\n`
    text += ctx.i18n.t('buildings.winChance.info')

    text += '\n'
    text += `*${ctx.i18n.t('battle.solo')}*\n`
    text += WIN_CHANCE_INFLUENCERS
      .map(building =>
        createBuildingCostPerWinChanceLine('solo', building, buildings[building])
      )
      .join('\n')

    text += '\n\n'
    text += `*${ctx.i18n.t('battle.alliance')}*\n`
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

export const bot = new Composer<Context>()
const menuMiddleware = new MenuMiddleware('buildings/', menu)
bot.command('buildings', async ctx => menuMiddleware.replyToContext(ctx))
bot.use(menuMiddleware)

const debouncedBuildStats = new ContextAwareDebounce(async (ctx: Context) => menuMiddleware.replyToContext(ctx), DEBOUNCE_TIME)
bot.on('text', whenScreenContainsInformation(['buildings', 'resources', 'workshop'], ctx => {
  debouncedBuildStats.callFloating(ctx.from.id, ctx)
}))
