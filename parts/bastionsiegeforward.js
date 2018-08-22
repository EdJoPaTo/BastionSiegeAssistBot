const Telegraf = require('telegraf')

const {Markup, Extra} = Telegraf

const {createBuildingTimeStatsString, createFillTimeStatsString} = require('../lib/create-stats-strings')
const {getScreenInformation} = require('../lib/gamescreen')
const {estimateResourcesAfterTimespan} = require('../lib/siegemath')

const bot = new Telegraf.Composer()

function isForwardedFromBastionSiege(ctx) {
  return ctx && ctx.message && ctx.message.forward_from && ctx.message.forward_from.id === 252148344
}

bot.on('text', Telegraf.optional(isForwardedFromBastionSiege, (ctx, next) => {
  if (!ctx.session.gameInformation) {
    ctx.session.gameInformation = {
      buildings: null,
      workshop: null,
      resources: null
    }
  }

  const timestamp = ctx.message.forward_date
  const newInformation = getScreenInformation(ctx.message.text)

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

  ctx.session.gameInformation = Object.assign(ctx.session.gameInformation, newInformation)
  return next()
}))

const buildingsToShow = ['townhall', 'storage', 'houses', 'barracks', 'wall', 'trebuchet']
const updateMarkup = Extra.markup(Markup.inlineKeyboard([
  Markup.callbackButton('estimate current situation', 'estimate')
]))

bot.on('text', Telegraf.optional(isForwardedFromBastionSiege, ctx => {
  const information = ctx.session.gameInformation

  if (!information.buildingTimestamp) {
    return ctx.reply('please forward me the building screen from your game')
  }
  if (!information.resourceTimestamp) {
    return ctx.reply('please forward me a screen from the game showing your current resources')
  }

  const statsText = generateStatsText(information)
  return ctx.reply(statsText, updateMarkup)
}))

bot.action('estimate', async ctx => {
  try {
    const newStats = generateStatsText(ctx.session.gameInformation)
    const oldStats = ctx.callbackQuery.message.text

    if (compareStrAsSimpleOne(newStats, oldStats) === 0) {
      return ctx.answerCbQuery('thats already as good as I can estimate!')
    }
    await ctx.editMessageText(newStats, updateMarkup)
    return ctx.answerCbQuery('updated!')
  } catch (ex) {
    return ctx.answerCbQuery('please provide new game screens')
  }
})

function generateStatsText(information) {
  const currentTimestamp = Math.floor(Date.now() / 1000)
  const resourceAgeMinutes = Math.floor((currentTimestamp - information.resourceTimestamp) / 60)
  const buildingAgeMinutes = Math.floor((currentTimestamp - information.buildingTimestamp) / 60)

  const buildings = Object.assign(information.buildings, information.workshop)

  const estimatedResources = estimateResourcesAfterTimespan(information.resources, buildings.townhall, buildings.storage, buildings.houses, buildings.sawmill, buildings.mine, buildings.farm, resourceAgeMinutes)

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

module.exports = bot
