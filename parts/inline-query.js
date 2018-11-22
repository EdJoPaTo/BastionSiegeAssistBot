const Telegraf = require('telegraf')

const battlereports = require('../lib/battlereports')
const playerStats = require('../lib/player-stats')
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

  const enemies = allBattlereports
    .filter(o => o.enemies.length === 1)
    .map(o => o.enemies[0])
    .filter(o => regex.test(o))

  // Order them by occurence count
  // https://stackoverflow.com/questions/22010520/sort-by-number-of-occurrencecount-in-javascript-array
  const battlesObserved = enemies.reduce((p, c) => {
    p[c] = (p[c] || 0) + 1
    return p
  }, {})
  const orderedEnemies = Object.keys(battlesObserved).sort((a, b) => battlesObserved[b] - battlesObserved[a])

  const results = orderedEnemies
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

  return ctx.answerInlineQuery(results, {
    cache_time: 2,
    next_offset: orderedEnemies.length > offset + 50 ? String(offset + 50) : ''
  })
})

module.exports = {
  bot
}
