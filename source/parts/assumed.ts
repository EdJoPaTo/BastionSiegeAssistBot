import {Composer, Extra, Markup, ContextMessageUpdate} from 'telegraf'
import {estimateResourcesAfter, Constructions, ResourceName, DomainStats} from 'bastion-siege-logic'

import {compareStrAsSimpleOne} from '../lib/javascript-abstraction/strings'

import {Session, GameInformation} from '../lib/types'

import {emoji} from '../lib/user-interface/output-text'
import {formatNumberShort, formatTimeAmount} from '../lib/user-interface/format-number'

export const bot = new Composer()
const prefix = '*Currently Assumed Data*\nBattlereports and time influences what the bot expects from your game data.\nKnown issues: people in houses are not considered for gold income\n\n'

const updateMarkup = Extra.markdown().markup(Markup.inlineKeyboard([
  Markup.callbackButton('estimate current situation', 'assumed'),
  Markup.urlButton('Join BastionSiegeAssist Support Group', 'https://t.me/joinchat/AC0dV1dG2Y7sOFQPtZm9Dw')
] as any, {columns: 1}))

bot.command('assumed', sendAssumed)

async function sendAssumed(ctx: ContextMessageUpdate): Promise<void> {
  const session = (ctx as any).session as Session
  const information = session.gameInformation

  if (!information.resourcesTimestamp) {
    await ctx.replyWithMarkdown(prefix + 'Please forward me a screen from the game showing your current resources first.')
  }

  const statsText = generateText(information)
  await ctx.replyWithMarkdown(prefix + statsText, updateMarkup)
}

bot.action('assumed', async ctx => {
  try {
    const session = (ctx as any).session as Session
    const newStats = prefix + generateText(session.gameInformation)
    const oldStats = ctx.callbackQuery!.message!.text!

    if (compareStrAsSimpleOne(newStats, oldStats) === 0) {
      return ctx.answerCbQuery('thats already as good as I can estimate!')
    }

    await ctx.editMessageText(newStats, updateMarkup)
    return ctx.answerCbQuery('updated!')
  } catch (_) {
    return ctx.answerCbQuery('please provide new game screens')
  }
})

function generateText(information: GameInformation): string {
  // Unix timestamp just without seconds (/60)
  const currentTimestamp = Math.floor(Date.now() / 1000 / 60)
  const resourceAgeMinutes = currentTimestamp - Math.floor(information.resourcesTimestamp! / 60)

  const buildings: Constructions = {...information.buildings!, ...information.workshop!}

  const estimatedResources = estimateResourcesAfter(information.resources!, buildings, resourceAgeMinutes)

  let text = ''

  const combined = {
    ...estimatedResources,
    ...information.domainStats!
  }
  const keys = Object.keys(combined) as (ResourceName | keyof DomainStats)[]
  text += keys.map(key => {
    const value = combined[key]
    const short = formatNumberShort(value, true)
    const longNeeded = compareStrAsSimpleOne(String(value), short) !== 0
    const long = longNeeded ? '  ' + String(value) : ''
    return `${emoji[key]} ${short}${long}`
  }).join('\n') + '\n'

  text += '\n'
  text += '*Age of last well known Data*\n'
  text += ['resources', 'buildings', 'domainStats']
    .filter(o => (information as any)[o + 'Timestamp'])
    .map(o => {
      const timestamp: number = (information as any)[o + 'Timestamp']
      const ageInMinutes = currentTimestamp - Math.floor(timestamp / 60)
      const ageString = formatTimeAmount(ageInMinutes)
      return `${o}: ${ageString}`
    })
    .join('\n') + '\n'

  return text
}

module.exports = {
  bot
}
