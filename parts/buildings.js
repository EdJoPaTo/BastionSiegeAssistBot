const Telegraf = require('telegraf')
const debounce = require('debounce-promise')

const {compareStrAsSimpleOne} = require('../lib/javascript-abstraction/strings')

const {estimateResourcesAfterTimespan} = require('../lib/math/siegemath')

const {
  buildingNames,
  defaultBuildingsToShow,
  createBuildingTimeStatsString,
  createFillTimeStatsString
} = require('../lib/user-interface/buildings')

const {Markup, Extra} = Telegraf

const DEBOUNCE_TIME = 100 // Milliseconds

const bot = new Telegraf.Composer()
const prefix = '*Building Upgrades*\n'

function isBuildingsOrResources(ctx) {
  if (!ctx.state.screen) {
    return false
  }
  const {buildings, resources, workshop} = ctx.state.screen.information || {}
  return buildings || resources || workshop
}

const updateMarkup = Extra.markdown().markup(Markup.inlineKeyboard([
  Markup.callbackButton('estimate current situation', 'buildings')
]))

const debouncedBuildStats = {}
bot.on('text', Telegraf.optional(isBuildingsOrResources, ctx => {
  const {id} = ctx.from
  if (!debouncedBuildStats[id]) {
    debouncedBuildStats[id] = debounce(sendBuildStats, DEBOUNCE_TIME)
  }
  debouncedBuildStats[id](ctx)
}))

bot.command('buildings', sendBuildStats)

function sendBuildStats(ctx) {
  const information = ctx.session.gameInformation

  if (!information.buildingsTimestamp) {
    return ctx.replyWithMarkdown(prefix + 'Please forward me the building screen from your game in order to get building upgrade stats.')
  }
  if (!information.resourcesTimestamp) {
    return ctx.replyWithMarkdown(prefix + 'Please forward me a screen from the game showing your current resources in order to get building upgrade stats.')
  }

  const statsText = generateStatsText(information, ctx.session.buildings)
  return ctx.reply(prefix + statsText, updateMarkup)
}

bot.action('buildings', async ctx => {
  try {
    const newStats = prefix + generateStatsText(ctx.session.gameInformation, ctx.session.buildings)
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

function generateStatsText(information, buildingsToShow) {
  // Unix timestamp just without seconds (/60)
  const currentTimestamp = Math.floor(Date.now() / 1000 / 60)
  const resourceAgeMinutes = currentTimestamp - Math.floor(information.resourcesTimestamp / 60)
  const buildingAgeMinutes = currentTimestamp - Math.floor(information.buildingsTimestamp / 60)

  const buildings = {...information.buildings, ...information.workshop}

  const estimatedResources = estimateResourcesAfterTimespan(information.resources, buildings, resourceAgeMinutes)

  let text = ''

  buildingsToShow = buildingsToShow || defaultBuildingsToShow
  text += Object.keys(buildingNames)
    .filter(o => buildingsToShow.indexOf(o) >= 0)
    .map(o => createBuildingTimeStatsString(o, buildings, estimatedResources))
    .join('\n')
  text += '\n\n'

  text += createFillTimeStatsString(buildings, estimatedResources)

  text += '\n'
  if (resourceAgeMinutes > 30) {
    text += '⚠️ My knowledge of your ressources is a bit old. This leads to inaccuracy. Consider updating me with a new forwarded resource screen.\n'
  }
  if (buildingAgeMinutes > 60 * 5) {
    text += '⚠️ My knowledge of your buildings is a bit old. This leads to inaccuracy. Consider updating me with a new forwarded building screen.\n'
  }
  return text
}

module.exports = {
  bot
}
