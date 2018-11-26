const Telegraf = require('telegraf')

const battlereports = require('../lib/battlereports')
const playerStats = require('../lib/player-stats')

const {getAllEnemies} = require('../lib/battle-stats')
const {createPlayerStatsString, createPlayerStatsShortString} = require('../lib/create-stats-strings')

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
        title: stats.player,
        description: createPlayerStatsShortString(allBattlereports, stats),
        input_message_content: {
          message_text: createPlayerStatsString(allBattlereports, stats),
          parse_mode: 'markdown'
        }
      }
    })

  const options = {
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
