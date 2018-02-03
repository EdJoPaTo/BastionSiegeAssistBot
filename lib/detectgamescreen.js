function detectgamescreen(content) {
  const lines = content.split('\n')

  if (lines[0].indexOf('Buildings') >= 0) {
    return 'buildings'
  }

  return 'unknown'
}

module.exports = {
  detectgamescreen: detectgamescreen
}
