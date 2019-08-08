type Dictionary<T> = {[key: string]: T}

export interface SumAverageAmount {
  amount: number;
  avg: number;
  min: number;
  max: number;
  stdDeviation: number;
  sum: number;
}

export function getStdDeviation(numbers: readonly number[], average: number, distanceFunc = (base: number, other: number) => other - base): number {
  const tmpVariance = numbers
    .map(o => distanceFunc(average, o))
    .map(o => o * o)
    .reduce((a, b) => a + b, 0)
  const variance = tmpVariance / numbers.length
  const stdDeviation = Math.sqrt(variance)
  return stdDeviation
}

export function getSumAverageAmount(numbers: readonly (number | null | undefined)[]): SumAverageAmount {
  const validNumbers = numbers.filter(o => o || o === 0) as number[]
  const sum = validNumbers.reduce((a, b) => a + b, 0)
  const amount = validNumbers.length
  const avg = sum / amount

  const stdDeviation = getStdDeviation(validNumbers, avg)

  return {
    amount,
    avg,
    min: Math.min(...validNumbers),
    max: Math.max(...validNumbers),
    stdDeviation,
    sum
  }
}

export function getSumAverageAmountGroupedBy<T>(array: readonly T[], keySelector: (val: T) => string, numberSelector: (val: T) => number): {all: SumAverageAmount; grouped: Dictionary<SumAverageAmount>} {
  const all = getSumAverageAmount(array.map(numberSelector))

  const grouped = array.reduce((col, add) => {
    const key = keySelector(add)
    if (!col[key]) {
      col[key] = []
    }

    col[key].push(numberSelector(add))
    return col
  }, {} as Dictionary<number[]>)

  const result: Dictionary<SumAverageAmount> = {}
  for (const key of Object.keys(grouped)) {
    result[key] = getSumAverageAmount(grouped[key])
  }

  return {
    all,
    grouped: result
  }
}

module.exports = {
  getStdDeviation,
  getSumAverageAmount,
  getSumAverageAmountGroupedBy
}
