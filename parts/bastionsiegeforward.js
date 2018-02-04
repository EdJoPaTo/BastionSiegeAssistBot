const Telegraf = require('telegraf')

const { emoji, getScreenInformation } = require('../lib/gamescreen')
const { formatNumberShort, formatTime } = require('../lib/numberFunctions')
const { calcGoldCapacity, calcGoldIncome, calcBuildingCost, calcProduction, calcProductionFood, calcStorageCapacity, calcStorageLevelNeededForUpgrade, calcMinutesNeeded } = require('../lib/siegemath')

const bot = new Telegraf.Composer()

bot.on('text', (ctx, next) => {
  if (!ctx.session.gameInformation) {
    ctx.session.gameInformation = {}
  }

  const timestamp = ctx.message.forward_date
  const newInformation = getScreenInformation(ctx.message.text)

  if (newInformation.townhall) {
    newInformation.buildingTimestamp = timestamp
  } else if (newInformation.gold) {
    newInformation.resourceTimestamp = timestamp
  } else if (newInformation.trebuchet) {
    newInformation.workshopTimestamp = timestamp
  }

  ctx.session.gameInformation = Object.assign(ctx.session.gameInformation, newInformation)
  return next()
})

const buildingsToShow = ['townhall', 'storage', 'houses', 'barracks', 'wall', 'trebuchet']

bot.on('text', ctx => {
  const information = ctx.session.gameInformation

  if (!information.buildingTimestamp) {
    return ctx.reply('please forward me the building screen from your game')
  } else if (!information.resourceTimestamp) {
    return ctx.reply('please forward me a screen from the game showing your current resources')
  }

  const storageCapacity = calcStorageCapacity(information.storage)

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

    const minutesNeeded = calcMinutesNeeded(cost, information.townhall, information.houses, information.sawmill, information.mine, information.gold, information.wood, information.stone)
    if (minutesNeeded === 0) {
      text += '✅'
    } else {
      text += `${formatTime(minutesNeeded)} needed`
    }

    const neededMaterialString = getNeededMaterialString(cost, information.gold, information.wood, information.stone)
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

  text += '\n🔜 in order to increase accuracy provide me updated resources or buildings of your game'
  return ctx.reply(text)
})

function getNeededMaterialString(cost, currentGold, currentWood, currentStone) {
  const goldNeeded = cost.gold - currentGold
  const woodNeeded = cost.wood - currentWood
  const stoneNeeded = cost.stone - currentStone

  const neededMaterial = []
  if (goldNeeded > 0) { neededMaterial.push(`${formatNumberShort(goldNeeded, true)}${emoji.gold}`) }
  if (woodNeeded > 0) { neededMaterial.push(`${formatNumberShort(woodNeeded, true)}${emoji.wood}`) }
  if (stoneNeeded > 0) { neededMaterial.push(`${formatNumberShort(stoneNeeded, true)}${emoji.stone}`) }
  return neededMaterial.join(', ')
}

const abstraction = new Telegraf.Composer()
abstraction.use(Telegraf.optional(ctx => ctx && ctx.message && ctx.message.forward_from && ctx.message.forward_from.id === 252148344, bot))
module.exports = abstraction
