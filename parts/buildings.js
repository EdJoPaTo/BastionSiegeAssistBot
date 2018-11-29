const Telegraf = require('telegraf')
const debounce = require('debounce-promise')

const {Markup, Extra} = Telegraf

const {createBuildingTimeStatsString, createFillTimeStatsString} = require('../lib/create-stats-strings')
const {estimateResourcesAfterTimespan} = require('../lib/siegemath')

const DEBOUNCE_TIME = 100 // Milliseconds

const bot = new Telegraf.Composer()

function isBuildingsOrResources(ctx) {
  if (!ctx.state.screen) {
    return false
  }
  const {buildings, resources, workshop} = ctx.state.screen.information || {}
  return buildings || resources || workshop
}

// Save buildings and resource
bot.on('text', Telegraf.optional(isBuildingsOrResources, (ctx, next) => {
  const newInformation = ctx.state.screen.information
  const {timestamp} = ctx.state.screen

  if (newInformation.buildings) {
    newInformation.buildingTimestamp = timestamp
    if (ctx.session.gameInformation.buildingTimestamp >= timestamp) {
      return ctx.reply('Thats not new to me. I will just ignore it.')
    }
  } else if (newInformation.resources) {
    newInformation.resourceTimestamp = timestamp
    if (ctx.session.gameInformation.resourceTimestamp >= timestamp) {
      return ctx.reply('Thats not new to me. I will just ignore it.')
    }
  } else if (newInformation.workshop) {
    newInformation.workshopTimestamp = timestamp
    if (ctx.session.gameInformation.workshopTimestamp >= timestamp) {
      return ctx.reply('Thats not new to me. I will just ignore it.')
    }
  }

  Object.assign(ctx.session.gameInformation, newInformation)
  return next()
}))

const buildingsToShow = ['townhall', 'storage', 'houses', 'mine', 'barracks', 'wall', 'trebuchet', 'ballista']
const updateMarkup = Extra.markup(Markup.inlineKeyboard([
  Markup.callbackButton('estimate current situation', 'estimate')
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

  if (!information.buildingTimestamp) {
    return ctx.reply('please forward me the building screen from your game')
  }
  if (!information.resourceTimestamp) {
    return ctx.reply('please forward me a screen from the game showing your current resources')
  }

  const statsText = generateStatsText(information)
  return ctx.reply(statsText, updateMarkup)
}

bot.action('estimate', async ctx => {
  try {
    const newStats = generateStatsText(ctx.session.gameInformation)
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

function generateStatsText(information) {
  const currentTimestamp = Math.floor(Date.now() / 1000)
  const resourceAgeMinutes = Math.floor((currentTimestamp - information.resourceTimestamp) / 60)
  const buildingAgeMinutes = Math.floor((currentTimestamp - information.buildingTimestamp) / 60)

  const buildings = {...information.buildings, ...information.workshop}

  const estimatedResources = estimateResourcesAfterTimespan(information.resources, buildings, resourceAgeMinutes)

  let text = ''

  for (const buildingName of buildingsToShow) {
    text += createBuildingTimeStatsString(buildingName, buildings, estimatedResources) + '\n'
  }
  text += '\n'

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

function compareStrAsSimpleOne(str1, str2) {
  const tmp1 = str1.replace(/[^\w\d]/g, '')
  const tmp2 = str2.replace(/[^\w\d]/g, '')

  return tmp1.localeCompare(tmp2)
}

module.exports = {
  bot
}
