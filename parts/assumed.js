const Telegraf = require('telegraf')

const {compareStrAsSimpleOne} = require('../lib/javascript-abstraction/strings')

const {estimateResourcesAfterTimespan} = require('../lib/math/siegemath')

const {emoji} = require('../lib/user-interface/output-text')
const {formatNumberShort, formatTimeAmount} = require('../lib/user-interface/format-number')

const {Markup, Extra} = Telegraf

const bot = new Telegraf.Composer()
const prefix = '*Currently Assumed Data*\nBattlereports and time influences what the bot expects from your game data.\nKnown issues: people in houses are not considered for gold income\n\n'

const updateMarkup = Extra.markdown().markup(Markup.inlineKeyboard([
  Markup.callbackButton('estimate current situation', 'assumed'),
  Markup.urlButton('Join BastionSiegeAssist Support Group', 'https://t.me/joinchat/AC0dV1dG2Y7sOFQPtZm9Dw')
], {columns: 1}))

bot.command('assumed', sendAssumed)

function sendAssumed(ctx) {
  const information = ctx.session.gameInformation

  if (!information.resourcesTimestamp) {
    return ctx.replyWithMarkdown(prefix + 'Please forward me a screen from the game showing your current resources first.')
  }

  const statsText = generateText(information)
  return ctx.replyWithMarkdown(prefix + statsText, updateMarkup)
}

bot.action('assumed', async ctx => {
  try {
    const newStats = prefix + generateText(ctx.session.gameInformation)
    const oldStats = ctx.callbackQuery.message.text

    if (compareStrAsSimpleOne(newStats, oldStats) === 0) {
      return ctx.answerCbQuery('thats already as good as I can estimate!')
    }
    await ctx.editMessageText(newStats, updateMarkup)
    return ctx.answerCbQuery('updated!')
  } catch (error) {
    return ctx.answerCbQuery('please provide new game screens')
  }
})

function generateText(information) {
  // Unix timestamp just without seconds (/60)
  const currentTimestamp = Math.floor(Date.now() / 1000 / 60)
  const resourceAgeMinutes = currentTimestamp - Math.floor(information.resourcesTimestamp / 60)

  const buildings = {...information.buildings, ...information.workshop}

  const estimatedResources = estimateResourcesAfterTimespan(information.resources, buildings, resourceAgeMinutes)

  let text = ''

  const combined = {
    ...estimatedResources,
    ...information.domainStats
  }
  const keys = Object.keys(combined)
  text += keys.map(key => {
    const value = combined[key]
    const short = formatNumberShort(value, true)
    const longNeeded = compareStrAsSimpleOne(String(value), short) !== 0
    const long = longNeeded ? '  ' + value : ''
    return `${emoji[key]} ${short}${long}`
  }).join('\n') + '\n'

  text += '\n'
  text += '*Age of last well known Data*\n'
  text += ['resources', 'buildings', 'domainStats']
    .filter(o => information[o + 'Timestamp'])
    .map(o => {
      const timestamp = information[o + 'Timestamp']
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
