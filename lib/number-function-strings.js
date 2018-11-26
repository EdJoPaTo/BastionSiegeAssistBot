const {formatNumberShort} = require('./number-functions')

function createSumAverageAmountString(data, name, unit) {
  // Assumes the data is for integers
  let line = `${name} `
  line += `(${formatNumberShort(data.amount, true)})`

  if (data.amount > 0) {
    line += ': '
    if (data.amount > 1) {
      line += `~${formatNumberShort(data.avg)}${unit}`
      line += ' ('
      line += `Min: ${formatNumberShort(data.min, true)}${unit}`
      line += '; '
      line += `Max: ${formatNumberShort(data.max, true)}${unit}`
      line += '; '
      line += `Total: ${formatNumberShort(data.sum, true)}${unit}`
      line += ')'
    } else {
      line += `${formatNumberShort(data.avg, true)}${unit}`
    }
  }
  return line
}

function createAmountAverageDeviationString(data, name, unit) {
  // Assumes the data is for integers
  let line = `${name} `
  line += `(${formatNumberShort(data.amount, true)})`

  if (data.amount > 0) {
    line += ': '
    line += `${formatNumberShort(data.avg, true)}${unit}`
    if (data.amount > 1) {
      line += ` ± ${formatNumberShort(data.stdDeviation)}${unit}`
    }
  }
  return line
}

module.exports = {
  createAmountAverageDeviationString,
  createSumAverageAmountString
}
