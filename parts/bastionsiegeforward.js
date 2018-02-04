const Telegraf = require('telegraf')

const { Markup, Extra } = Telegraf

const { emoji, getScreenInformation } = require('../lib/gamescreen')
const { formatNumberShort, formatTime } = require('../lib/numberFunctions')
const { calcGoldCapacity, calcGoldIncome, calcBuildingCost, calcProduction, calcProductionFood, calcStorageCapacity, calcStorageLevelNeededForUpgrade, calcMinutesNeeded, estimateResourcesAfterTimespan } = require('../lib/siegemath')

const bot = new Telegraf.Composer()

function isForwardedFromBastionSiege(ctx) {
  return ctx && ctx.message && ctx.message.forward_from && ctx.message.forward_from.id === 252148344
}

bot.on('text', Telegraf.optional(isForwardedFromBastionSiege, (ctx, next) => {
  if (!ctx.session.gameInformation) {
    ctx.session.gameInformation = {}
  }

  const timestamp = ctx.message.forward_date
  const newInformation = getScreenInformation(ctx.message.text)

  if (newInformation.townhall) {
    newInformation.buildingTimestamp = timestamp
    if (ctx.session.gameInformation.buildingTimestamp > timestamp) {
      return ctx.reply('I already know something newer. I will ignore this one.')
    }
  } else if (newInformation.gold) {
    newInformation.resourceTimestamp = timestamp
    if (ctx.session.gameInformation.resourceTimestamp > timestamp) {
      return ctx.reply('I already know something newer. I will ignore this one.')
    }
  } else if (newInformation.trebuchet) {
    newInformation.workshopTimestamp = timestamp
    if (ctx.session.gameInformation.workshopTimestamp > timestamp) {
      return ctx.reply('I already know something newer. I will ignore this one.')
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
  } else if (!information.resourceTimestamp) {
    return ctx.reply('please forward me a screen from the game showing your current resources')
  }

  const statsText = generateStatsText(information)
  return ctx.reply(statsText, updateMarkup)
}))

bot.action('estimate', async ctx => {
  const newStats = generateStatsText(ctx.session.gameInformation)
  const oldStats = ctx.callbackQuery.message.text

  if (newStats.localeCompare(oldStats) >= 0) { // not sure why not === 0, but seems like it works
    return ctx.answerCbQuery('thats already as good as I can estimate!')
  } else {
    await ctx.editMessageText(newStats, updateMarkup)
    return ctx.answerCbQuery('updated!')
  }
})

function generateStatsText(information) {
  const currentTimestamp = Math.floor(Date.now() / 1000)
  const resourceAgeMinutes = Math.floor((currentTimestamp - information.resourceTimestamp) / 60)
  const buildingAgeMinutes = Math.floor((currentTimestamp - information.buildingTimestamp) / 60)

  const storageCapacity = calcStorageCapacity(information.storage)
  const currentResources = { gold: information.gold, wood: information.wood, stone: information.stone, food: information.food }
  const estimatedResources = estimateResourcesAfterTimespan(currentResources, information.townhall, information.storage, information.houses, information.sawmill, information.mine, information.farm, resourceAgeMinutes)

  let text = ''

  for (const buildingName of buildingsToShow) {
    text += emoji[buildingName] + ' '
    if (!information[buildingName]) {
      text += `⚠️ unknown ${buildingName} level\n`
      continue
    }

    const cost = calcBuildingCost(buildingName, information[buildingName])
    if (cost.wood > storageCapacity || cost.stone > storageCapacity) {
      text += `⚠️ storage level ${calcStorageLevelNeededForUpgrade(buildingName, information[buildingName] + 1)} needed\n`
      continue
    }

    const minutesNeeded = calcMinutesNeeded(cost, information.townhall, information.houses, information.sawmill, information.mine, estimatedResources)
    if (minutesNeeded === 0) {
      text += '✅'
    } else {
      text += `${formatTime(minutesNeeded)} needed`
    }

    const neededMaterialString = getNeededMaterialString(cost, estimatedResources)
    if (neededMaterialString.length > 0) {
      text += ` (${neededMaterialString})\n`
    } else {
      text += '\n'
    }
  }
  text += '\n'

  const goldCapacity = calcGoldCapacity(information.townhall)
  const goldFillTimeNeeded = (goldCapacity - information.gold) / calcGoldIncome(information.townhall, information.houses)
  const woodFillTimeNeeded = (storageCapacity - information.wood) / calcProduction(information.sawmill)
  const stoneFillTimeNeeded = (storageCapacity - information.stone) / calcProduction(information.mine)
  const foodProduction = calcProductionFood(information.farm, information.houses)

  text += `${emoji.gold} full in ${formatTime(goldFillTimeNeeded)} (${formatNumberShort(goldCapacity - information.gold)}${emoji.gold})\n`
  text += `${emoji.wood} full in ${formatTime(woodFillTimeNeeded)} (${formatNumberShort(storageCapacity - information.wood)}${emoji.wood})\n`
  text += `${emoji.stone} full in ${formatTime(stoneFillTimeNeeded)} (${formatNumberShort(storageCapacity - information.stone)}${emoji.stone})\n`

  if (foodProduction > 0) {
    const foodFillTimeNeeded = (storageCapacity - information.food) / calcProduction(information.mine)
    text += `${emoji.food} full in ${formatTime(foodFillTimeNeeded)} (${formatNumberShort(storageCapacity - information.food)}${emoji.food})\n`
  } else if (foodProduction < 0) {
    const foodEmptyTimeNeeded = information.food / -foodProduction
    text += `${emoji.food} empty in ${formatTime(foodEmptyTimeNeeded)} (${formatNumberShort(information.food)}${emoji.food})\n`
  }

  text += '\n'
  if (resourceAgeMinutes > 30) {
    text += '⚠️ My knowledge of your ressources is a bit old. This leads to inaccuracy. Consider updating me with a new forwarded resource screen.\n'
  }
  if (buildingAgeMinutes > 60 * 5) {
    text += '⚠️ My knowledge of your buildings is a bit old. This leads to inaccuracy. Consider updating me with a new forwarded building screen.\n'
  }
  return text
}

function getNeededMaterialString(cost, currentResources) {
  const goldNeeded = cost.gold - currentResources.gold
  const woodNeeded = cost.wood - currentResources.wood
  const stoneNeeded = cost.stone - currentResources.stone

  const neededMaterial = []
  if (goldNeeded > 0) { neededMaterial.push(`${formatNumberShort(goldNeeded, true)}${emoji.gold}`) }
  if (woodNeeded > 0) { neededMaterial.push(`${formatNumberShort(woodNeeded, true)}${emoji.wood}`) }
  if (stoneNeeded > 0) { neededMaterial.push(`${formatNumberShort(stoneNeeded, true)}${emoji.stone}`) }
  return neededMaterial.join(', ')
}

module.exports = bot
