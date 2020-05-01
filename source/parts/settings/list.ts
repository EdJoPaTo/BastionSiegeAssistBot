import {MenuTemplate, Body} from 'telegraf-inline-menu'

import {Context} from '../../lib/types'

import * as lists from '../../lib/data/inline-lists'
import * as poweruser from '../../lib/data/poweruser'

import {backButtons} from '../../lib/user-interface/menu'
import {createList} from '../../lib/user-interface/inline-list'
import {emoji} from '../../lib/user-interface/output-text'

function menuBody(ctx: Context): Body {
  const now = Date.now() / 1000
  const isPoweruser = poweruser.isPoweruser(ctx.from!.id)
  let text = ''
  text += emoji.list + ' '
  text += `*${'List'}*\n`

  if (!isPoweruser) {
    text += emoji.poweruser + ' '
    text += ctx.i18n.t('poweruser.usefulWhen')
    text += '\n\n'
  }

  text += ctx.i18n.t('list.help')

  if (isPoweruser) {
    text += '\n\n'
    text += createList(ctx.from!.id, 'default', now).text
  }

  return {text, parse_mode: 'Markdown'}
}

export const menu = new MenuTemplate<Context>(menuBody)

menu.switchToChat(ctx => ctx.i18n.t('list.share'), 'list', {
  hide: ctx => !poweruser.isPoweruser(ctx.from!.id)
})

menu.interact(ctx => ctx.i18n.t('list.clearParticipants'), 'clear-participants', {
  hide: ctx => !poweruser.isPoweruser(ctx.from!.id) || Object.keys(lists.getList(ctx.from!.id, 'default', Date.now() / 1000).participants).length === 0,
  do: async (ctx, next) => {
    const now = Date.now() / 1000
    const {participants} = lists.getList(ctx.from!.id, 'default', now)
    const participantIds = Object.keys(participants).map(o => Number(o))

    await lists.leave(ctx.from!.id, 'default', now, participantIds)
    return next()
  }
})

menu.manualRow(backButtons)
