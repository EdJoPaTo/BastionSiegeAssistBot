const Telegraf = require('telegraf')

const { emoji, getScreenInformation } = require('../lib/gamescreen')
const { formatNumberShort, formatTime } = require('../lib/numberFunctions')
const { calcGoldCapacity, calcBuildingCost, calcStorageCapacity, calcStorageLevelNeededForUpgrade, calcMinutesNeeded } = require('../lib/siegemath')

const bot = new Telegraf.Composer()

bot.on('text', (ctx, next) => {
  if (!ctx.session.gameInformation) {
    ctx.session.gameInformation = {}
  }

  const newInformation = getScreenInformation(ctx.message.text)
  ctx.session.gameInformation = Object.assign(ctx.session.gameInformation, newInformation)
  return next()
})

const buildingsToShow = ['townhall', 'storage', 'houses', 'barracks', 'wall', 'trebuchet']

bot.on('text', ctx => {
  const information = ctx.session.gameInformation

  if (!information.townhall) {
    return ctx.reply('please forward me the building screen from your game')
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

  const fullStorage = {
    gold: calcGoldCapacity(information.townhall),
    wood: storageCapacity,
    stone: storageCapacity
  }
  const storageFillTimeNeeded = calcMinutesNeeded(fullStorage, information.townhall, information.houses, information.sawmill, information.mine, information.gold, information.wood, information.stone)

  const neededMaterialString = getNeededMaterialString(fullStorage, information.gold, information.wood, information.stone)
  text += `\nstorages full in ${formatTime(storageFillTimeNeeded)} (${neededMaterialString})\n`

  text += '\n\n🔜 in order to increase accuracy provide me updated resources or buildings of your game'
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
