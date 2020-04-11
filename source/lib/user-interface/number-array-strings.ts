import {SumAverageAmount} from '../math/number-array'

import {formatNumberShort} from './format-number'

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
  line += createSimpleDataString(data, unit, selection, isInteger)

  return line
}

export function createSimpleDataString(data: SumAverageAmount, unit: string, selection: readonly (keyof SumAverageAmount)[], isInteger: boolean): string {
  if (data.amount === 0) {
    return 'NaN' + unit
  }

  if (data.amount === 1) {
    return formatNumberShort(data.sum, isInteger) + unit
  }

  return selection
    .map(o => formatTypeOfData(data, o, isInteger) + unit)
    .join(' ')
}

export function formatTypeOfData(data: SumAverageAmount, type: keyof SumAverageAmount, isInteger: boolean): string {
  switch (type) {
    case 'average' as any:
    case 'avg':
      return '~' + formatNumberShort(data.avg)
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
