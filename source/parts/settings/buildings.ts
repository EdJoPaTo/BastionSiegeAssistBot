import {CONSTRUCTIONS, ConstructionName} from 'bastion-siege-logic'
import TelegrafInlineMenu from 'telegraf-inline-menu'

import {toggleInArray} from '../../lib/javascript-abstraction/array'

import {Session} from '../../lib/types'

import {getBuildingText, defaultBuildingsToShow} from '../../lib/user-interface/buildings'

function menuText(ctx: any): string {
  let text = `*${ctx.i18n.t('bs.buildings')}*`
  text += '\n'
  text += ctx.i18n.t('setting.buildings.infotext')
  return text
}

export const menu = new TelegrafInlineMenu(menuText)

menu.select('b', CONSTRUCTIONS, {
  multiselect: true,
  columns: 2,
  textFunc: (ctx, key) => getBuildingText(ctx, key as ConstructionName),
  setFunc: (ctx: any, key) => {
    const session = ctx.session as Session
    session.buildings = toggleInArray(session.buildings || defaultBuildingsToShow, key as ConstructionName, (a, b) => a.localeCompare(b))
  },
  isSetFunc: (ctx: any, key) => {
    const session = ctx.session as Session
    return (session.buildings || defaultBuildingsToShow).includes(key as ConstructionName)
  }
})
