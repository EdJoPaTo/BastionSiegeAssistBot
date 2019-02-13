const Telegraf = require('telegraf')
const debounce = require('debounce-promise')

const {compareStrAsSimpleOne} = require('../lib/javascript-abstraction/strings')

const {estimateResourcesAfterTimespan} = require('../lib/math/siegemath')

const {
  BUILDINGS,
  defaultBuildingsToShow,
  createBuildingTimeStatsString,
  createBuildingMaxLevelStatsString,
  createFillTimeStatsString
} = require('../lib/user-interface/buildings')

const {Markup, Extra} = Telegraf

const DEBOUNCE_TIME = 100 // Milliseconds

const bot = new Telegraf.Composer()

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
    return ctx.replyWithMarkdown(ctx.i18n.t('buildings.need.buildings'))
  }

  if (!information.resourcesTimestamp) {
    return ctx.replyWithMarkdown(ctx.i18n.t('buildings.need.resources'))
  }

  const statsText = generateStatsText(ctx)
  return ctx.reply(statsText, updateMarkup)
}

bot.action('buildings', async ctx => {
  try {
    const newStats = generateStatsText(ctx)
    const oldStats = ctx.callbackQuery.message.text

    if (compareStrAsSimpleOne(newStats, oldStats) === 0) {
      return ctx.answerCbQuery(ctx.i18n.t('menu.nothingchanged'))
    }

    await ctx.editMessageText(newStats, updateMarkup)
    return ctx.answerCbQuery()
  } catch (error) {
    return ctx.answerCbQuery('please provide new game screens')
  }
})

function generateStatsText(ctx) {
  const information = ctx.session.gameInformation
  let buildingsToShow = ctx.session.buildings

  // Unix timestamp just without seconds (/60)
  const currentTimestamp = Math.floor(Date.now() / 1000 / 60)
  const resourceAgeMinutes = currentTimestamp - Math.floor(information.resourcesTimestamp / 60)
  const buildingAgeMinutes = currentTimestamp - Math.floor(information.buildingsTimestamp / 60)

  const buildings = {...information.buildings, ...information.workshop}

  const estimatedResources = estimateResourcesAfterTimespan(information.resources, buildings, resourceAgeMinutes)

  let text = ''

  buildingsToShow = BUILDINGS
    .filter(o => (buildingsToShow || defaultBuildingsToShow).includes(o))

  text += `*${ctx.i18n.t('buildings.title')}*\n`
  text += buildingsToShow
    .map(o => createBuildingTimeStatsString(o, buildings, estimatedResources))
    .join('\n')
  text += '\n\n'

  text += `*${ctx.i18n.t('buildings.maxPossible')}*\n`
  text += buildingsToShow
    .filter(o => o !== 'storage')
    .map(o => createBuildingMaxLevelStatsString(o, buildings, estimatedResources))
    .join('\n')
  text += '\n\n'

  text += `*${ctx.i18n.t('buildings.fillStorage')}*\n`
  text += createFillTimeStatsString(buildings, estimatedResources)
  text += '\n'

  if (resourceAgeMinutes > 30) {
    text += `⚠️ ${ctx.i18n.t('buildings.old.resources')}\n`
  }

  if (buildingAgeMinutes > 60 * 5) {
    text += `⚠️ ${ctx.i18n.t('buildings.old.buildings')}\n`
  }

  return text
}

module.exports = {
  bot
}
