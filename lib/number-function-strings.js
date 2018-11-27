const {formatNumberShort} = require('./number-functions')

function createSumAverageAmountString(data, name, unit, isInteger = false) {
  return createArrayDataString({data, name, unit}, ['avg', 'min', 'max', 'sum'], isInteger)
}

function createAmountAverageDeviationString(data, name, unit, isInteger = false) {
  return createArrayDataString({data, name, unit}, ['avg', 'stdDeviation'], isInteger)
}

function createArrayDataString({data, name, unit}, selection, isInteger = false) {
  let line = name
  line += ` (${formatNumberShort(data.amount, true)})`

  if (data.amount === 0 || selection.length === 0) {
    return line
  }

  line += ': '

  if (data.amount === 1) {
    line += formatNumberShort(data.sum, isInteger) + unit
  } else {
    line += selection
      .map(o => formatTypeOfData(data, o, isInteger) + unit)
      .join(' ')
  }
  return line
}

function formatTypeOfData(data, type, isInteger) {
  switch (type) {
    case 'average':
    case 'avg':
      return '~' + formatNumberShort(data.avg)
    case 'stdDeviation':
      return '±' + formatNumberShort(data.stdDeviation)
    case 'sum':
      return '=' + formatNumberShort(data.sum, isInteger)
    case 'min':
      return '≥' + formatNumberShort(data.min, isInteger)
    case 'max':
      return '≤' + formatNumberShort(data.max, isInteger)
    default:
      throw new Error('undefined data type to show')
  }
}

module.exports = {
  createAmountAverageDeviationString,
  createArrayDataString,
  createSumAverageAmountString
}
