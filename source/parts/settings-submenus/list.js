const TelegrafInlineMenu = require('telegraf-inline-menu')

const lists = require('../../lib/data/inline-lists')
const poweruser = require('../../lib/data/poweruser')

const {emoji} = require('../../lib/user-interface/output-text')
const {createList} = require('../../lib/user-interface/inline-list')

function menuText(ctx) {
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

const menu = new TelegrafInlineMenu(menuText)

menu.switchToChatButton(ctx => ctx.i18n.t('list.share'), 'list', {
  hide: ctx => !poweruser.isPoweruser(ctx.from.id)
})

menu.button(ctx => ctx.i18n.t('list.clearParticipants'), 'clear-participants', {
  hide: ctx => !poweruser.isPoweruser(ctx.from.id) || Object.keys(lists.getList(ctx.from.id, 'default', Date.now() / 1000).participants).length === 0,
  doFunc: ctx => {
    const now = Date.now() / 1000
    const {participants} = lists.getList(ctx.from.id, 'default', now)

    lists.leave(ctx.from.id, 'default', now, Object.keys(participants))
  }
})

module.exports = {
  menu
}
