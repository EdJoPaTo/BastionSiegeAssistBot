import {Composer, ContextMessageUpdate} from 'telegraf'
import {Gamescreen} from 'bastion-siege-logic'
import debounce from 'debounce-promise'

import {whenScreenContainsInformation, whenScreenIsOfType} from '../lib/input/gamescreen'

import {ONE_DAY_IN_SECONDS} from '../lib/math/unix-timestamp'

import * as castleSiege from '../lib/data/castle-siege'
import * as userSessions from '../lib/data/user-sessions'
import {MAX_PLAYER_AGE_DAYS} from '../lib/data/poweruser'

import {createPlayerMarkdownLink, createPlayerNameString} from '../lib/user-interface/player-stats'

import {notNewMiddleware} from '../lib/telegraf-middlewares'

type Dictionary<T> = {[key: string]: T}

const DEBOUNCE_TIME = 200 // Milliseconds

const MAXIMUM_PLAYER_AGE = ONE_DAY_IN_SECONDS * MAX_PLAYER_AGE_DAYS

export const bot = new Composer()

const debouncedParticipants: Dictionary<(ctx: ContextMessageUpdate, timestamp: number, alliance: string) => Promise<void>> = {}
bot.on('text', whenScreenContainsInformation('castleSiegePlayerJoined', notNewMiddleware('forward.old', castleSiege.MAXIMUM_JOIN_MINUTES), ctx => {
  const {castleSiegePlayerJoined, timestamp} = (ctx as any).state.screen as Gamescreen
  const {alliance, name} = castleSiegePlayerJoined!
  castleSiege.add(timestamp, alliance!, name)

  const {id} = ctx.from!
  if (!debouncedParticipants[id]) {
    debouncedParticipants[id] = debounce(replyCastleParticipants, DEBOUNCE_TIME)
  }

  debouncedParticipants[id](ctx, timestamp, alliance!)
}))

async function replyCastleParticipants(ctx: ContextMessageUpdate, timestamp: number, alliance: string): Promise<void> {
  const participants = castleSiege.getParticipants(timestamp, alliance)
    .map(o => o.player)

  const missingMates = userSessions.getRaw()
    .filter(o => o.data.gameInformation.playerTimestamp && o.data.gameInformation.playerTimestamp + MAXIMUM_PLAYER_AGE > timestamp)
    .filter(o => o.data.gameInformation.player!.alliance === alliance)
    .filter(o => !participants.includes(o.data.gameInformation.player!.name))
    .map(({user, data}) => ({user, player: data.gameInformation.player!.name}))

  let text = ''
  text += `*${(ctx as any).i18n.t('bs.siege')}*\n`
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

  await ctx.replyWithMarkdown(text)
}

bot.on('text', whenScreenContainsInformation('castleSiegeAllianceJoined', notNewMiddleware('forward.old', castleSiege.MAXIMUM_JOIN_MINUTES), async ctx => {
  const {castleSiegeAllianceJoined, timestamp} = (ctx as any).state.screen as Gamescreen
  castleSiege.add(timestamp, castleSiegeAllianceJoined!.alliance, undefined)

  return ctx.reply(`Thats fancy ${castleSiegeAllianceJoined!.alliance} joined but I dont know what to do with that information. 😇`)
}))

bot.on('text', whenScreenIsOfType('castleSiegeYouJoined', notNewMiddleware('forward.old', castleSiege.MAXIMUM_JOIN_MINUTES), async ctx => {
  return ctx.reply('Thats fancy you joined but I currently only work with messages of others joining in. 😇')
}))
