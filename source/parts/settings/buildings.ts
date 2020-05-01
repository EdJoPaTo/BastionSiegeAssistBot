import {CONSTRUCTIONS, ConstructionName} from 'bastion-siege-logic'
import {MenuTemplate, Body} from 'telegraf-inline-menu'

import {toggleInArray} from '../../lib/javascript-abstraction/array'

import {Context} from '../../lib/types'

import {getBuildingText, defaultBuildingsToShow} from '../../lib/user-interface/buildings'
import {backButtons} from '../../lib/user-interface/menu'

function menuBody(ctx: Context): Body {
  let text = `*${ctx.i18n.t('bs.buildings')}*`
  text += '\n'
  text += ctx.i18n.t('setting.buildings.infotext')
  return {text, parse_mode: 'Markdown'}
}

export const menu = new MenuTemplate<Context>(menuBody)

menu.select('b', CONSTRUCTIONS, {
  multiselect: true,
  columns: 2,
  buttonText: (ctx, key) => getBuildingText(ctx, key as ConstructionName),
  set: (ctx, key) => {
    ctx.session.buildings = toggleInArray(ctx.session.buildings || defaultBuildingsToShow, key as ConstructionName, (a, b) => a.localeCompare(b))
  },
  isSet: (ctx, key) => (ctx.session.buildings || defaultBuildingsToShow).includes(key as ConstructionName)
})

menu.manualRow(backButtons)
