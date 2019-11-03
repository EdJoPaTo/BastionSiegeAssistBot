import TelegrafInlineMenu from 'telegraf-inline-menu'

import * as lists from '../../lib/data/inline-lists'
import * as poweruser from '../../lib/data/poweruser'

import {emoji} from '../../lib/user-interface/output-text'
import {createList} from '../../lib/user-interface/inline-list'

function menuText(ctx: any): string {
  const now = Date.now() / 1000
  const isPoweruser = poweruser.isPoweruser(ctx.from.id)
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
    text += createList(ctx.from.id, 'default', now).text
  }

  return text
}

export const menu = new TelegrafInlineMenu(menuText)

menu.switchToChatButton((ctx: any) => ctx.i18n.t('list.share'), 'list', {
  hide: ctx => !poweruser.isPoweruser(ctx.from!.id)
})

menu.button((ctx: any) => ctx.i18n.t('list.clearParticipants'), 'clear-participants', {
  hide: ctx => !poweruser.isPoweruser(ctx.from!.id) || Object.keys(lists.getList(ctx.from!.id, 'default', Date.now() / 1000).participants).length === 0,
  doFunc: ctx => {
    const now = Date.now() / 1000
    const {participants} = lists.getList(ctx.from!.id, 'default', now)
    const participantIds = Object.keys(participants).map(o => Number(o))

    lists.leave(ctx.from!.id, 'default', now, participantIds)
  }
})

module.exports = {
  menu
}
