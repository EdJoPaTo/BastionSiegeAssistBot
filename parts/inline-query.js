const Telegraf = require('telegraf')

const battlereports = require('../lib/data/battlereports')

const playerStats = require('../lib/math/player-stats')
const playerStatsSearch = require('../lib/math/player-stats-search')
const {getAllEnemies} = require('../lib/math/battle-stats')

const {createPlayerNameString, createPlayerStatsString, createPlayerStatsShortString} = require('../lib/user-interface/player-stats')

const bot = new Telegraf.Composer()

function escapeRegexSpecificChars(input) {
  return input
    .replace('[', '\\[')
    .replace(']', '\\]')
    .replace('(', '\\(')
    .replace(')', '\\)')
}

bot.on('inline_query', async ctx => {
  const regex = new RegExp(escapeRegexSpecificChars(ctx.inlineQuery.query), 'i')
  const offset = ctx.inlineQuery.offset || 0

  const basicOptions = {
    is_personal: true,
    cache_time: playerStatsSearch.MAX_SECONDS_FOR_ONE_SEARCH
  }

  const canSearch = playerStatsSearch.canSearch(ctx.session.search)
  if (!canSearch) {
    return ctx.answerInlineQuery([], {
      ...basicOptions,
      switch_pm_text: 'Provide some Battlereports :)',
      switch_pm_parameter: 'more-battlereports-please'
    })
  }
  ctx.session.search = playerStatsSearch.applySearch(ctx.session.search)

  const allBattlereports = await battlereports.getAll()

  const enemies = getAllEnemies(allBattlereports)
    .filter(o => regex.test(o))

  const results = enemies
    .slice(offset, offset + 50)
    .map(o => playerStats.generate(allBattlereports, o))
    .map(stats => {
      return {
        type: 'article',
        id: `player-${stats.player}`,
        title: createPlayerNameString(stats),
        description: createPlayerStatsShortString(stats),
        input_message_content: {
          message_text: createPlayerStatsString(stats),
          parse_mode: 'markdown'
        }
      }
    })

  const options = {
    ...basicOptions,
    next_offset: enemies.length > offset + 50 ? String(offset + 50) : ''
  }
  if (process.env.NODE_ENV !== 'production') {
    options.cache_time = 2
  }

  return ctx.answerInlineQuery(results, options)
})

module.exports = {
  bot
}
