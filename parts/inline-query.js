const Telegraf = require('telegraf')

const {sortBy} = require('../lib/javascript-abstraction/array')

const battlereports = require('../lib/data/battlereports')

const {mystics} = require('../lib/input/game-text')

const playerStats = require('../lib/math/player-stats')
const playerStatsSearch = require('../lib/math/player-stats-search')

const {createPlayerNameString, createPlayerStatsString, createPlayerStatsShortString} = require('../lib/user-interface/player-stats')

const bot = new Telegraf.Composer()

bot.on('inline_query', async ctx => {
  const {query} = ctx.inlineQuery
  const offset = ctx.inlineQuery.offset || 0
  const canSearch = playerStatsSearch.canSearch(ctx.session.search)

  let players = []
  const options = {
    is_personal: true,
    cache_time: playerStatsSearch.MAX_SECONDS_FOR_ONE_SEARCH
  }

  if (canSearch && query && query.length >= 2) {
    const queryTestFunc = getTestFunctionForQuery(query)

    const allPlayers = battlereports.getAllPlayers()
    players = allPlayers
      .filter(o => queryTestFunc(createPlayerNameString(o)))
      .map(o => o.player)

    ctx.session.search = playerStatsSearch.applySearch(ctx.session.search)
  } else {
    players = [...mystics]

    if (canSearch) {
      // No query given
      options.is_personal = false
      options.cache_time = 60 * 5
    } else {
      // No searches left
      options.switch_pm_text = 'Provide some Battlereports :)'
      options.switch_pm_parameter = 'more-battlereports-please'
    }
  }

  const allBattlereports = await battlereports.getAll()
  const results = players
    .map(o => playerStats.generate(allBattlereports, o))
    .sort(sortBy(o => o.battlesObserved, true))
    .slice(offset, offset + 50)
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

  options.next_offset = players.length > offset + 50 ? String(offset + 50) : ''
  if (process.env.NODE_ENV !== 'production') {
    options.cache_time = 2
  }

  return ctx.answerInlineQuery(results, options)
})

function getTestFunctionForQuery(query) {
  try {
    const regex = new RegExp(query, 'i')
    return o => regex.test(o)
  } catch (error) {
    return o => o.indexOf(query) >= 0
  }
}

module.exports = {
  bot
}
