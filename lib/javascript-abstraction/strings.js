function compareStrAsSimpleOne(str1, str2) {
  const tmp1 = str1.replace(/[^\w\d]/g, '')
  const tmp2 = str2.replace(/[^\w\d]/g, '')

  return tmp1.localeCompare(tmp2)
}

function getUnicode(text) {
  const result = []
  for (let i = 0; i < text.length; i++) {
    result.push(text.charCodeAt(i).toString(16))
  }

  return result
}

function replaceLookingLikeAsciiChars(input) {
  const result = input
    .replace(/\u0410/g, 'A')
    .replace(/\u0412/g, 'B')
    .replace(/\u0415/g, 'E')
    .replace(/\u0417/g, '3')
    .replace(/\u041A/g, 'K')
    .replace(/\u041C/g, 'M')
    .replace(/\u041D/g, 'H')
    .replace(/\u041E/g, 'O')
    .replace(/\u0420/g, 'P')
    .replace(/\u0421/g, 'C')
    .replace(/\u0422/g, 'T')
    .replace(/\u0425/g, 'X')
    .replace(/\u0430/g, 'a')
    .replace(/\u0433/g, 'r')
    .replace(/\u0435/g, 'e')
    .replace(/\u043E/g, 'o')
    .replace(/\u0440/g, 'p')
    .replace(/\u0441/g, 'c')
    .replace(/\u0443/g, 'y')
    .replace(/\u0445/g, 'x')

  return result
}

module.exports = {
  compareStrAsSimpleOne,
  getUnicode,
  replaceLookingLikeAsciiChars
}
