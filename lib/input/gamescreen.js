const Telegraf = require('telegraf')

const languages = {
  en: require('./gamescreen.en'),
  ru: require('./gamescreen.ru')
}

function detectGamescreen(content) {
  const languageNames = Object.keys(languages)

  for (const lang of languageNames) {
    const type = languages[lang].detectType(content)
    if (type) {
      return {
        type,
        lang
      }
    }
  }

  return {}
}

function getScreenInformation(content) {
  const gamescreen = detectGamescreen(content)
  const {type, lang} = gamescreen
  if (!lang) {
    return {}
  }

  return languages[lang].getScreenInformation(type, content)
}

// When at least one of the name argument is available middlewares are executed
function whenScreenContainsInformation(names, ...middlewares) {
  const namesArr = Array.isArray(names) ? names : [names]
  const predicate = ctx => {
    if (!ctx.state.screen) {
      return false
    }

    const available = Object.keys(ctx.state.screen.information || {})
    return namesArr.some(n => available.includes(n))
  }

  return Telegraf.optional(predicate, ...middlewares)
}

module.exports = {
  detectGamescreen,
  getScreenInformation,
  whenScreenContainsInformation
}
