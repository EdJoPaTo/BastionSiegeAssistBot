import {existsSync, readFileSync} from 'fs'

import Telegraf, {Extra, Markup} from 'telegraf'
import I18n from 'telegraf-i18n'

import {Session} from './lib/types'

import {initData} from './lib/data'
import * as userSessions from './lib/data/user-sessions'
import * as wars from './lib/data/wars'

import * as bastionsiegeforward from './parts/bastionsiegeforward'
import * as inlineQuery from './parts/inline-query'
import * as partAlerts from './parts/alerts'
import * as partAlliances from './parts/alliances'
import * as partAssumed from './parts/assumed'
import * as partBattlereport from './parts/battlereport'
import * as partBattleStats from './parts/battlestats'
import * as partBotStats from './parts/bot-stats'
import * as partBuildings from './parts/buildings'
import * as partCastleSiege from './parts/castle-siege'
import * as partEffects from './parts/effects'
import * as partHelp from './parts/help'
import * as partHints from './parts/hints'
import * as partList from './parts/list'
import * as partPlayerStats from './parts/playerstats'
import * as partSettings from './parts/settings'
import * as partWar from './parts/war'

initData()

const tokenFilePath = existsSync('/run/secrets') ? '/run/secrets/bot-token.txt' : 'bot-token.txt'
const token = readFileSync(tokenFilePath, 'utf8').trim()
const bot = new Telegraf(token)

if (process.env.NODE_ENV !== 'production') {
  bot.use(async (ctx, next) => {
    const identifier = [
      new Date().toISOString(),
      Number(ctx.update.update_id).toString(16),
      ctx.from && ctx.from.first_name,
      ctx.updateType
    ].join(' ')
    const callbackData = ctx.callbackQuery && ctx.callbackQuery.data
    const inlineQuery = ctx.inlineQuery && ctx.inlineQuery.query
    const messageText = ctx.message && ctx.message.text
    const data = callbackData || inlineQuery || messageText
    console.time(identifier)
    if (next) {
      await next()
    }

    if (data) {
      console.timeLog(identifier, data.length, data.replace(/\n/g, '\\n').slice(0, 50))
    } else {
      console.timeLog(identifier)
    }
  })
}

bot.use(async (ctx, next) => {
  try {
    if (next) {
      await next()
    }
  } catch (error) {
    if (error.message.includes('Too Many Requests')) {
      console.warn('Telegraf Too Many Requests error. Skip.', error)
      return
    }

    if (error.message.includes('RESULT_ID_INVALID')) {
      console.warn('ERROR', error.message)
      return
    }

    console.error('try to send error to user', ctx.update, error)
    let text = '🔥 Something went wrong here!'
    text += '\n'
    text += 'You should join the Support Group and report this error. Let us make this bot even better together. ☺️'

    text += '\n'
    text += '\nError: `'
    text += error.message
      .replace(token, '')
    text += '`'

    const target = (ctx.chat || ctx.from!).id
    const keyboard = Markup.inlineKeyboard([
      Markup.urlButton('Join BastionSiegeAssist Support Group', 'https://t.me/joinchat/AC0dV1dG2Y7sOFQPtZm9Dw')
    ], {columns: 1})
    await ctx.telegram.sendMessage(target, text, Extra.markdown().markup(keyboard))
  }
})

bot.use(userSessions.middleware())
wars.init(bot.telegram)

// See https://yaml-multiline.info/ for multiline yaml stuff
const i18n = new I18n({
  directory: 'locales',
  defaultLanguage: 'en',
  defaultLanguageOnMissing: true,
  useSession: true
})

bot.use(i18n.middleware())

bot.use((ctx, next) => {
  const {username} = ctx.from || {}
  const session = (ctx as any).session as Session
  if (username) {
    session.__username = username
  } else {
    delete session.__username
  }

  return next && next()
})

// Fix previous bot problems
bot.use((ctx, next) => {
  const {session} = (ctx as any)
  if (session.gameInformation) {
    const allKeys = Object.keys(session.gameInformation)
    const keysWithValueNull = allKeys
      .filter(o => session.gameInformation[o] === null)

    keysWithValueNull
      .forEach(o => {
        /* eslint @typescript-eslint/no-dynamic-delete: off */
        delete session.gameInformation[o]
      })
  }

  delete session.battlestatsTimeframe
  delete session.battlestatsType
  delete session.language
  delete session.search

  if (session.gameInformation) {
    delete session.gameInformation.attackscout
    delete session.gameInformation.attackscoutTimestamp
  }

  return next && next()
})

partAlerts.start(bot.telegram)
bot.use(partAlerts.bot.middleware())

bot.use(bastionsiegeforward.bot.middleware())
bot.use(inlineQuery.bot.middleware() as any)
bot.use(partHints.bot.middleware())

bot.use(partAlliances.bot.middleware())
bot.use(partAssumed.bot.middleware())
bot.use(partBattlereport.bot.middleware())
bot.use(partBattleStats.bot.middleware())
bot.use(partBotStats.bot.middleware())
bot.use(partBuildings.bot.middleware())
bot.use(partCastleSiege.bot.middleware())
bot.use(partEffects.bot.middleware())
bot.use(partList.bot.middleware())
bot.use(partPlayerStats.bot.middleware())
bot.use(partSettings.bot.middleware())
bot.use(partWar.bot.middleware())

bot.use(partHelp.bot.middleware())

bot.catch((error: any) => {
  console.error('Telegraf Error', error.response || error)
})

async function startup(): Promise<void> {
  await bot.launch()
  console.log(new Date(), 'Bot started as', bot.options.username)
}

startup()
