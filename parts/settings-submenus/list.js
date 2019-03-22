const TelegrafInlineMenu = require('telegraf-inline-menu')

const lists = require('../../lib/data/inline-lists')
const poweruser = require('../../lib/data/poweruser')

const {emoji} = require('../../lib/user-interface/output-text')
const {createList} = require('../../lib/user-interface/inline-list')

function menuText(ctx) {
  const now = Date.now() / 1000
  let text = ''

  if (!poweruser.isPoweruser(ctx.from.id)) {
    text += `*${'List'}*\n`
    text += emoji.poweruser + ' '
    text += ctx.i18n.t('poweruser.usefulWhen')
    return text
  }

  text += createList(ctx.from.id, now).text

  return text
}

const menu = new TelegrafInlineMenu(menuText)

menu.switchToChatButton(ctx => ctx.i18n.t('list.share'), 'list', {
  hide: ctx => !poweruser.isPoweruser(ctx.from.id)
})

menu.button(ctx => ctx.i18n.t('list.clearParticipants'), 'clear-participants', {
  hide: ctx => !poweruser.isPoweruser(ctx.from.id) || Object.keys(lists.getList(ctx.from.id, Date.now() / 1000).participants).length === 0,
  doFunc: ctx => {
    const now = Date.now() / 1000
    const {participants} = lists.getList(ctx.from.id, now)

    lists.leave(ctx.from.id, now, Object.keys(participants))
  }
})

module.exports = {
  menu
}
