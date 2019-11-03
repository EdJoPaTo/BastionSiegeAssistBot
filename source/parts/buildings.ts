import {Composer, ContextMessageUpdate} from 'telegraf'
import {CONSTRUCTIONS, calcMaxBuildingLevel, estimateResourcesAfter, BattleBuilding} from 'bastion-siege-logic'
import debounce from 'debounce-promise'
import TelegrafInlineMenu from 'telegraf-inline-menu'

import {Session, BUILDING_VIEWS, BuildingView} from '../lib/types'

import {calculateSecondsFromTimeframeString} from '../lib/math/timeframe'

import {whenScreenContainsInformation} from '../lib/input/gamescreen'

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
import {DEFAULT_HISTORY_TIMEFRAME, buildingsHistoryGraphFromContext} from '../lib/user-interface/buildings-history'

import * as buildingsMenu from './settings/buildings'

type Dictionary<T> = {[key: string]: T}

const DEBOUNCE_TIME = 200 // Milliseconds

const DEFAULT_VIEW = BUILDING_VIEWS[0]

const WIN_CHANCE_INFLUENCERS: BattleBuilding[] = ['barracks', 'trebuchet', 'wall']

export const bot = new Composer()

const menu = new TelegrafInlineMenu(generateStatsText, {
  photo: generateStatsPhoto
})
  .setCommand('buildings')

const replyMenuMiddleware = menu.replyMenuMiddleware().middleware()

const debouncedBuildStats: Dictionary<(ctx: ContextMessageUpdate, next: any) => Promise<void>> = {}
bot.on('text', whenScreenContainsInformation(['buildings', 'resources', 'workshop'], (ctx: any) => {
  const {id} = ctx.from
  if (!debouncedBuildStats[id]) {
    debouncedBuildStats[id] = debounce(replyMenuMiddleware, DEBOUNCE_TIME)
  }

  debouncedBuildStats[id](ctx, undefined)
}))

menu.submenu(ctx => `${emoji.houses} ${(ctx as any).i18n.t('bs.buildings')}`, 'buildings', buildingsMenu.menu, {
  hide: (ctx: any) => {
    const session = ctx.session as Session
    return (session.buildingsView || DEFAULT_VIEW) !== 'upgrades'
  }
})

menu.select('t', ['1 min', '15 min', '30 min', '1h', '6h', '12h', '1d', '2d', '7d', '30d'], {
  columns: 5,
  setFunc: (ctx: any, key) => {
    const session = ctx.session as Session
    session.buildingsTimeframe = key
  },
  isSetFunc: (ctx: any, key) => {
    const session = ctx.session as Session
    return key === (session.buildingsTimeframe || '1 min')
  },
  hide: (ctx: any) => (ctx.session.buildingsView || DEFAULT_VIEW) !== 'income'
})

menu.select('historyT', ['7d', '14d', '28d', '90d'], {
  hide: (ctx: any) => {
    const session = ctx.session as Session
    return (session.buildingsView || DEFAULT_VIEW) !== 'history'
  },
  isSetFunc: (ctx: any, key) => {
    const session = ctx.session as Session
    return key === (session.buildingsHistoryTimeframe || DEFAULT_HISTORY_TIMEFRAME)
  },
  setFunc: (ctx: any, key) => {
    const session = ctx.session as Session
    session.buildingsHistoryTimeframe = key
  }
})

menu.select('view', BUILDING_VIEWS, {
  columns: 2,
  hide: (ctx: any) => creationNotPossibleReason(ctx) !== false,
  textFunc: (ctx: any, key) => ctx.i18n.t('buildings.' + key),
  isSetFunc: (ctx: any, key) => {
    const session = ctx.session as Session
    return (session.buildingsView || DEFAULT_VIEW) === key
  },
  setFunc: (ctx: any, key) => {
    const session = ctx.session as Session
    session.buildingsView = key as BuildingView
  }
})

bot.use(menu.init({
  backButtonText: (ctx: any) => `🔙 ${ctx.i18n.t('menu.back')}…`,
  actionCode: 'buildings'
}))

function creationNotPossibleReason(ctx: any): string | false {
  const information = ctx.session.gameInformation

  if (!information.buildingsTimestamp) {
    return ctx.i18n.t('buildings.need.buildings')
  }

  if (!information.resourcesTimestamp) {
    return ctx.i18n.t('buildings.need.resources')
  }

  return false
}

function creationWarnings(ctx: any): string[] {
  const session = ctx.session as Session
  const information = session.gameInformation
  const warnings = []

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

async function generateStatsPhoto(ctx: any): Promise<undefined | {source: Buffer}> {
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

function generateStatsText(ctx: any): string {
  const notPossibleReason = creationNotPossibleReason(ctx)
  if (notPossibleReason) {
    return notPossibleReason
  }

  const information = ctx.session.gameInformation
  const buildings = {...information.buildings, ...information.workshop}

  const currentTimestamp = Math.floor(Date.now() / 1000 / 60)
  const resourceAgeMinutes = currentTimestamp - Math.floor(information.resourcesTimestamp / 60)
  const estimatedResources = estimateResourcesAfter(information.resources, buildings, resourceAgeMinutes)

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
