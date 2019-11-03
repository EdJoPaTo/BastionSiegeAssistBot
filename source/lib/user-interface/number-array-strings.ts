import {SumAverageAmount} from '../math/number-array'

import {formatNumberShort} from './format-number'

export function createSumAverageAmountString(data: SumAverageAmount, name: string, unit: string, isInteger = false): string {
  return createArrayDataString({data, name, unit}, ['avg', 'min', 'max', 'sum'], isInteger)
}

export function createAmountAverageDeviationString(data: SumAverageAmount, name: string, unit: string, isInteger = false): string {
  return createArrayDataString({data, name, unit}, ['avg', 'stdDeviation'], isInteger)
}

export function createAverageMaxString(data: SumAverageAmount, name: string, unit: string, isInteger = false): string {
  return createArrayDataString({data, name, unit}, ['avg', 'max'], isInteger)
}

export function createAverageSumString(data: SumAverageAmount, name: string, unit: string, isInteger = false): string {
  return createArrayDataString({data, name, unit}, ['avg', 'sum'], isInteger)
}

export function createArrayDataString({data, name, unit}: {data: SumAverageAmount; name: string; unit: string}, selection: readonly (keyof SumAverageAmount)[], isInteger = false): string {
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

export function formatTypeOfData(data: SumAverageAmount, type: keyof SumAverageAmount, isInteger: boolean): string {
  switch (type) {
    case 'average' as any:
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
