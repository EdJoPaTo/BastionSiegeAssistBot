const Telegraf = require('telegraf')

const {whenScreenContainsInformation} = require('../lib/input/gamescreen')

const {ONE_DAY_IN_SECONDS} = require('../lib/math/unix-timestamp')

const castleSiege = require('../lib/data/castle-siege')
const userSessions = require('../lib/data/user-sessions')
const {MAX_PLAYER_AGE_DAYS} = require('../lib/data/poweruser')

const {createPlayerMarkdownLink, createPlayerNameString} = require('../lib/user-interface/player-stats')

const {notNewMiddleware} = require('../lib/telegraf-middlewares')

const MAXIMUM_PLAYER_AGE = ONE_DAY_IN_SECONDS * MAX_PLAYER_AGE_DAYS

const bot = new Telegraf.Composer()

bot.on('text', whenScreenContainsInformation('castleSiegePlayerJoined', notNewMiddleware('forward.old', castleSiege.MAXIMUM_JOIN_MINUTES), ctx => {
  const time = ctx.message.forward_date
  const {castleSiegePlayerJoined} = ctx.state.screen.information
  const {alliance, player} = castleSiegePlayerJoined
  castleSiege.add(time, alliance, player)

  const participants = castleSiege.getParticipants(time, alliance)
    .map(o => o.player)

  const missingMates = userSessions.getRaw()
    .filter(o => o.data.gameInformation.playerTimestamp + MAXIMUM_PLAYER_AGE > time)
    .filter(o => o.data.gameInformation.player.alliance === alliance)
    .filter(o => !participants.includes(o.data.gameInformation.player.name))
    .map(({user, data}) => ({user, player: data.gameInformation.player.name}))

  let text = ''
  text += `*${ctx.i18n.t('bs.siege')}*\n`
  text += '\n'

  if (missingMates.length > 0) {
    text += alliance + ' '
    text += `Missing (${missingMates.length}): `
    text += missingMates
      .sort((a, b) => a.player.localeCompare(b.player))
      .map(o => createPlayerMarkdownLink(o.user, o))
      .join(', ')
    text += '\n\n'
  }

  text += alliance + ' '
  text += `Participants (${participants.length}): `
  text += participants
    .map(o => createPlayerNameString({player: o}, true))
    .join(', ')
  text += '\n\n'

  return ctx.replyWithMarkdown(text)
}))

bot.on('text', whenScreenContainsInformation('castleSiegeAllianceJoined', notNewMiddleware('forward.old', castleSiege.MAXIMUM_JOIN_MINUTES), ctx => {
  const {castleSiegeAllianceJoined} = ctx.state.screen.information
  return ctx.reply(`Thats fancy ${castleSiegeAllianceJoined.alliance} joined but I dont know what to do with that information. 😇`)
}))

module.exports = {
  bot
}
