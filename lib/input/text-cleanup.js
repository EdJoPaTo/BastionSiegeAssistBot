function inputTextCleanup(text) {
  // Get rid of a possible https://en.wikipedia.org/wiki/Zero-width_joiner
  text = text.replace(/\u200d/g, '')
  // https://en.wikipedia.org/wiki/Zero-width_space
  text = text.replace(/\u200b/g, '')
  // https://emojipedia.org/variation-selector-16/
  text = text.replace(/\ufe0f/g, '')
  // Newline, tab, …
  text = text
    .replace(/\n/g, ' ')
    .replace(/\t/g, ' ')
    .replace(/\v/g, ' ')

  return text
}

module.exports = {
  inputTextCleanup
}
