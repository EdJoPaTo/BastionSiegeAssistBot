export function get(text: string, pattern: string | RegExp, group = 1): string | undefined {
  const regex = new RegExp(pattern)
  const match = regex.exec(text)
  if (!match) {
    return undefined
  }

  return match[group]
}

export function getNumber(text: string, pattern: string | RegExp, group = 1): number | undefined {
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
