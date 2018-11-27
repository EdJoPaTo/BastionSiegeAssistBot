const emojiRegex = require('emoji-tree/lib/emojiRegex')
const {dragon, undead} = require('./gamescreen.emoji')

function isDragonOrUndead(text) {
  return text === dragon || text === undead
}

function parse(text) {
  if (isDragonOrUndead(text)) {
    return {name: text}
  }

  // Get rid of a possible https://en.wikipedia.org/wiki/Zero-width_joiner
  text = text.replace(/\u200d/g, '')
  // https://emojipedia.org/variation-selector-16/
  text = text.replace(/\ufe0f/g, '')

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
  isDragonOrUndead,
  parse
}
