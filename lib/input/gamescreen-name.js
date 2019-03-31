const {inputTextCleanup} = require('bastion-siege-logic')
const emojiRegex = require('emoji-tree/lib/emojiRegex')

const {emoji, mystics, dragon, undead} = require('./game-text')

function isMystic(text) {
  return mystics.includes(text)
}

function parse(input) {
  const text = inputTextCleanup(input)
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
    if (!result.bonus && result.name.includes(emoji.undead)) {
      return {name: undead}
    }
  }

  return result
}

module.exports = {
  isMystic,
  parse
}
