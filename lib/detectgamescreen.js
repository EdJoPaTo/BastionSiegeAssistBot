function detectgamescreen(content) {
  const lines = content.split('\n')

  if (lines[0].indexOf('Buildings') >= 0) {
    return 'buildings'
  }
  if (lines[0].indexOf('Resources') >= 0) {
    return 'resources'
  }

  return 'unknown'
}

module.exports = {
  detectgamescreen: detectgamescreen
}
