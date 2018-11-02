const emojiRegex = require('emoji-tree/lib/emojiRegex')

function parse(text) {
  if (text === '🐲Dragon' || text === '☠️Undead army') {
    return {name: text}
  }

  const e = emojiRegex.source
  const concatedNamePart = [
    // First part (negative karma, conquerer, halloween, …)
    `(${e}+)?`,
    // Achievements
    `(?:{(${e}+)})?`,
    // Alliance
    `(?:\\[(${e}+)\\])?`,
    // Name
    /(.+)/
  ]
    .map(o => o.source || o)
    .join('')

  const match = new RegExp(concatedNamePart).exec(text)
  return {
    bonus: match[1],
    achievements: match[2],
    alliance: match[3],
    name: match[4]
  }
}

module.exports = {
  parse
}
