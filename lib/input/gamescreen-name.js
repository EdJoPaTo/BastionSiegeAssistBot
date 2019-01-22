const emojiRegex = require('emoji-tree/lib/emojiRegex')
const {emoji, mystics, dragon, undead} = require('./game-text')

function isMystic(text) {
  return mystics.indexOf(text) >= 0
}

function parse(text) {
  // Get rid of a possible https://en.wikipedia.org/wiki/Zero-width_joiner
  text = text.replace(/\u200d/g, '')
  // https://en.wikipedia.org/wiki/Zero-width_space
  text = text.replace(/\u200b/g, '')
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
  const result = {
    bonus: match[1],
    achievements: match[2],
    alliance: match[3],
    name: match[4]
  }
  if (!result.achievements && !result.alliance) {
    if (result.bonus === emoji.dragon) {
      return {name: dragon}
    }

    if (result.bonus === emoji.undead) {
      return {name: undead}
    }

    // Russian variant has emoji in the middle
    if (!result.bonus && result.name.indexOf(emoji.undead) >= 0) {
      return {name: undead}
    }
  }

  return result
}

module.exports = {
  isMystic,
  parse
}
