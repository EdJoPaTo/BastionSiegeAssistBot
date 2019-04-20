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

module.exports = {
  compareStrAsSimpleOne,
  getUnicode
}
