import {Extra, Markup, Telegram} from 'telegraf'
import {I18n, I18nContext} from '@edjopato/telegraf-i18n'

import {
  CONSTRUCTIONS,
  calcBuildingCost,
  calcGoldCapacity,
  calcGoldIncome,
  calcMinutesNeeded,
  calcProductionFood,
  calcStorageCapacity,
  nextBattleTimestamp
} from 'bastion-siege-logic'

import {createAlertAtTimestamp} from '../javascript-abstraction/alert'

import {ONE_HOUR_IN_SECONDS} from '../math/unix-timestamp'

import {Alert, Session, Context} from '../types'

import {emoji} from './output-text'
import {
  getBuildingText,
  defaultBuildingsToShow
} from './buildings'

interface EventEntry {
  readonly type: Alert;
  readonly timestamp: number;
  readonly text: string;
  readonly alertHeadsUpTime?: number;
  readonly alertMessage?: string;
  timeoutId?: NodeJS.Timeout;
}

const i18n = new I18n({
  directory: 'locales',
  defaultLanguageOnMissing: true,
  defaultLanguage: 'en'
})

function asContext(language: string | undefined): {i18n: I18nContext} {
  return {
    i18n: i18n.createContext(language || 'en', {}) as any
  }
}

export function getAlertText(ctx: Context, alertKey: Alert): string {
  const e = emoji[alertKey]
  const l = ctx.i18n.t('alert.' + alertKey + '.name')
  return `${e} ${l}`
}

export class AlertHandler {
  private readonly _alertsOfUsers: Record<number, EventEntry[]> = {}

  constructor(
    private readonly _telegram: Telegram
  ) {}

  generateUpcomingEventsList(session: Session, now: number): EventEntry[] {
    const {buildings: buildingsToShowSession, gameInformation} = session
    const language = session.__language_code ?? 'en'
    const eventList: EventEntry[] = []

    const {battleSoloTimestamp, battleAllianceTimestamp, domainStats} = gameInformation
    const {karma} = domainStats || {}
    const nextBattleTimestamps = nextBattleTimestamp(battleSoloTimestamp, battleAllianceTimestamp, karma)
    eventList.push({
      type: 'nextBattle',
      timestamp: nextBattleTimestamps.solo,
      text: i18n.t(language, 'alert.nextBattle.solo.upcoming'),
      alertMessage: i18n.t(language, 'alert.nextBattle.solo.alert')
    })
    eventList.push({
      type: 'nextBattle',
      timestamp: nextBattleTimestamps.alliancePure,
      text: i18n.t(language, 'alert.nextBattle.alliance.upcoming'),
      alertHeadsUpTime: 60 * 1,
      alertMessage: i18n.t(language, 'alert.nextBattle.alliance.alert')
    })

    const {resources, resourcesTimestamp} = gameInformation
    const resourceTimestampMinutes = Math.floor(resourcesTimestamp! / 60)
    const buildings = {...gameInformation.buildings!, ...gameInformation.workshop!}
    const buildingsToShow = new Set(buildingsToShowSession ?? defaultBuildingsToShow)
    if (resources && buildings.townhall) {
      const storageCapacity = calcStorageCapacity(buildings.storage)
      const goldCapacity = calcGoldCapacity(buildings.townhall)
      const buildingUpgradeEvents = CONSTRUCTIONS
        .filter(o => buildingsToShow.has(o))
        .map(buildingName => {
          const cost = calcBuildingCost(buildingName, buildings[buildingName])
          const minutesNeeded = calcMinutesNeeded(cost, buildings, resources)
          const timestamp = (resourceTimestampMinutes + minutesNeeded) * 60
          return {
            name: buildingName,
            cost,
            minutesNeeded,
            timestamp
          }
        })
        .filter(({cost}) => cost.gold <= goldCapacity)
        .filter(({cost}) => cost.wood <= storageCapacity)
        .filter(({cost}) => cost.stone <= storageCapacity)
        .filter(o => o.minutesNeeded > 0)
        .filter(o => o.timestamp > now)
        .map((o): EventEntry => ({
          type: 'buildingUpgrade',
          timestamp: o.timestamp,
          text: i18n.t(language, 'alert.buildingUpgrade.upcoming', {name: getBuildingText(asContext(language) as any, o.name)})
        }))
      eventList.push(...buildingUpgradeEvents)

      const goldProduction = calcGoldIncome(buildings.townhall, buildings.houses)
      const goldFillTimeNeeded = (goldCapacity - resources.gold) / goldProduction
      eventList.push({
        type: 'resourceWarning',
        timestamp: (resourceTimestampMinutes + goldFillTimeNeeded) * 60,
        text: i18n.t(language, 'alert.resourceWarning.goldFull.upcoming'),
        alertHeadsUpTime: 60 * 15, // 15 min earlier
        alertMessage: i18n.t(language, 'alert.resourceWarning.goldFull.alert')
      })

      const foodProduction = calcProductionFood(buildings.farm, buildings.houses)
      if (foodProduction < 0) {
        const foodEmptyTimeNeeded = resources.food / -foodProduction
        eventList.push({
          type: 'resourceWarning',
          timestamp: (resourceTimestampMinutes + foodEmptyTimeNeeded) * 60,
          text: i18n.t(language, 'alert.resourceWarning.foodEmpty.upcoming'),
          alertHeadsUpTime: ONE_HOUR_IN_SECONDS * 12, // 12h earlier
          alertMessage: i18n.t(language, 'alert.resourceWarning.foodEmpty.alert')
        })
      }
    }

    const {effects, effectsTimestamp} = gameInformation
    if (effects && effectsTimestamp) {
      const effectEvents = effects
        .filter(o => o.timestamp && o.timestamp > now)
        .map((effect): EventEntry => {
          let {timestamp, minutesRemaining} = effect
          if (!timestamp) {
            timestamp = effectsTimestamp + (minutesRemaining! * 60)
          }

          return {
            type: 'effect',
            timestamp,
            text: i18n.t(language, 'alert.effect.upcoming', {
              name: effect.emoji + ' `' + effect.name + '`'
            })
          }
        })
      eventList.push(...effectEvents)
    }

    return eventList
  }

  recreateAlerts(user: number, session: Session, now: number): void {
    const oldAlerts = this._alertsOfUsers[user] ?? []
    oldAlerts
      .filter(o => o.timeoutId)
      .forEach(o => {
        clearTimeout(o.timeoutId!)
      })

    const enabledAlerts = session.alerts ?? []
    const eventList = this.generateUpcomingEventsList(session, now)
      .filter(o => enabledAlerts.includes(o.type))

    const newAlerts = eventList.map(event => this.createAlertForEvent(user, event))

    this._alertsOfUsers[user] = newAlerts
  }

  createAlertForEvent(user: number, event: EventEntry): EventEntry {
    const unixTimestamp = event.timestamp - (event.alertHeadsUpTime || 0)
    const timestamp = unixTimestamp * 1000
    const timeoutId = createAlertAtTimestamp(timestamp, () => this.sendAlertForEvent(user, event))
    if (timeoutId) {
      event.timeoutId = timeoutId
    }

    return event
  }

  sendAlertForEvent(user: number, {type, alertMessage, text}: EventEntry): void {
    let message = emoji.alertEnabled
    message += emoji[type]
    message += alertMessage || text

    const keyboard = Markup.inlineKeyboard([
      Markup.urlButton(emoji.backTo + 'Open BastionSiege…', 'https://t.me/BastionSiegeBot')
    ])
    this._telegram.sendMessage(user, message, Extra.markdown().markup(keyboard))
      .catch(error => handleSendAlertError(user, error))
  }
}

function handleSendAlertError(user: number, error: Error): void {
  switch (error.message) {
    case '400: Bad Request: chat not found':
    case '403: Forbidden: bot was blocked by the user':
      console.warn('send Alert failed', user, error.message)
      return
    default:
      console.error('send Alert failed', user, error.message, error)
  }
}
