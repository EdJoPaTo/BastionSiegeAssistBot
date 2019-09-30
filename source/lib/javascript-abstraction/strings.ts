type Dictionary<T> = {[key: string]: T}

export function compareStrAsSimpleOne(str1: string, str2: string): number {
  const tmp1 = str1.replace(/[^\w\d]/g, '')
  const tmp2 = str2.replace(/[^\w\d]/g, '')

  return tmp1.localeCompare(tmp2)
}

export function getUnicode(text: string): readonly string[] {
  const result = []
  for (let i = 0; i < text.length; i++) {
    result.push(text.charCodeAt(i).toString(16))
  }

  return result
}

const LOOKING_ALIKE_SUBSTITUTION: Dictionary<string[]> = {
  3: ['\u0417'],
  A: ['\u0410'],
  a: ['\u0430'],
  B: ['\u0412'],
  C: ['\u0421'],
  c: ['\u0441'],
  E: ['\u0415'],
  e: ['\u0435'],
  H: ['\u041D'],
  K: ['\u041A'],
  M: ['\u041C'],
  O: ['\u041E'],
  o: ['\u043E'],
  P: ['\u0420'],
  p: ['\u0440'],
  r: ['\u0433'],
  T: ['\u0422'],
  X: ['\u0425'],
  x: ['\u0445'],
  y: ['\u0443']
}

export function replaceLookingLikeAsciiChars(input: string): string {
  let result = input
  for (const char of Object.keys(LOOKING_ALIKE_SUBSTITUTION)) {
    const toBeReplaced = LOOKING_ALIKE_SUBSTITUTION[char]
    const pattern = `[${toBeReplaced.join('')}]`
    const regex = new RegExp(pattern, 'g')
    result = result.replace(regex, char)
  }

  return result
}

module.exports = {
  compareStrAsSimpleOne,
  getUnicode,
  replaceLookingLikeAsciiChars
}
