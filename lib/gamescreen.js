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

module.exports = {
  detectGamescreen,
  getScreenInformation
}
