export interface SumAverageAmount {
  readonly amount: number;
  readonly avg: number;
  readonly min: number;
  readonly max: number;
  readonly sum: number;
}

export interface GroupedSumAverageAmount {
  readonly all: SumAverageAmount;
  readonly grouped: Readonly<Record<string, SumAverageAmount>>;
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

export function getSumAverageAmount(numbers: ReadonlyArray<number | null | undefined>): SumAverageAmount {
  const validNumbers = numbers.filter((o): o is number => o !== undefined && o !== null && Number.isFinite(o))
  const sum = validNumbers.reduce((a, b) => a + b, 0)
  const amount = validNumbers.length
  const avg = sum / amount

  return {
    amount,
    avg,
    min: Math.min(...validNumbers),
    max: Math.max(...validNumbers),
    sum
  }
}

export function getSumAverageAmountGroupedBy<T>(array: readonly T[], keySelector: (val: T) => string, numberSelector: (value: T) => number | undefined): GroupedSumAverageAmount {
  const all = getSumAverageAmount(array.map(o => numberSelector(o)))

  const grouped = array.reduce<Record<string, Array<number | undefined>>>((col, add) => {
    const key = keySelector(add)
    if (!col[key]) {
      col[key] = []
    }

    col[key].push(numberSelector(add))
    return col
  }, {})

  const result: Record<string, SumAverageAmount> = {}
  for (const key of Object.keys(grouped)) {
    result[key] = getSumAverageAmount(grouped[key])
  }

  return {
    all,
    grouped: result
  }
}
