const Telegraf = require('telegraf')

const { emoji, getScreenInformation } = require('../lib/gamescreen')
const { calcMinutesNeededForUpgrade } = require('../lib/siegemath')

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
  console.log('bastion siege message')
  const information = ctx.session.gameInformation

  if (!information.townhall) {
    return ctx.reply('please forward me the building screen from your game')
  }

  let text = ''

  for (const buildingName of buildingsToShow) {
    text += emoji[buildingName] + ' '
    if (!information[buildingName]) {
      text += `⚠️ unknown ${buildingName} level\n`
      continue
    }

    console.log(buildingName, information[buildingName], information.townhall, information.houses, information.sawmill, information.mine, information.gold, information.wood, information.stone)
    const minutesNeeded = calcMinutesNeededForUpgrade(buildingName, information[buildingName], information.townhall, information.houses, information.sawmill, information.mine, information.gold, information.wood, information.stone)
    if (minutesNeeded === 0) {
      text += '✅'
    } else {
      text += `${minutesNeeded} minutes needed`
    }
    text += '\n'
  }

  text += '\n\n🔜 in order to increase accuracy provide me updated resources or buildings of your game'
  return ctx.reply(text)
})

const abstraction = new Telegraf.Composer()
abstraction.use(Telegraf.optional(ctx => ctx && ctx.message && ctx.message.forward_from && ctx.message.forward_from.id === 252148344, bot))
module.exports = abstraction
