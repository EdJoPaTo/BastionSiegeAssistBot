function get(text, pattern, group = 1) {
  const regex = new RegExp(pattern)
  const match = regex.exec(text)
  if (!match) {
    return undefined
  }

  return match[group]
}

function getNumber(text, pattern, group = 1) {
  const result = get(text, pattern, group)
  if (result === undefined) {
    return result
  }

  return Number(result)
}

module.exports = {
  get,
  getNumber
}
