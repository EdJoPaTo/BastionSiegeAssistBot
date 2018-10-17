function get(text, pattern) {
  const regex = new RegExp(pattern)
  const match = regex.exec(text)
  if (!match) {
    return undefined
  }
  return match[1]
}

function getNumber(text, pattern) {
  const result = get(text, pattern)
  if (result === undefined) {
    return result
  }
  return Number(result)
}

module.exports = {
  get,
  getNumber
}
