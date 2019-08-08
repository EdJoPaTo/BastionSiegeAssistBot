type Dictionary<T> = {[key: string]: T}

export function arrayFilterUniqueInBetween<T>(selector: (o: T) => string = o => String(o)): (_: T, i: number, arr: readonly T[]) => boolean {
  // True -> stay in array and not get filtered out
  // False -> filter out

  const selected: Dictionary<string> = {}

  function select(arr: readonly T[], i: number): string {
    if (!selected[i]) {
      selected[i] = selector(arr[i])
    }

    return selected[i]
  }

  return (_: T, i: number, arr: readonly T[]) => {
    if (i === 0 || i === arr.length - 1) {
      return true
    }

    const before = select(arr, i - 1)
    const current = select(arr, i)
    const after = select(arr, i + 1)

    if (before !== current || before !== after) {
      // Something is different -> keep in
      return true
    }

    return false
  }
}

// https://stackoverflow.com/questions/22010520/sort-by-number-of-occurrencecount-in-javascript-array
export function getOccurenceCount(arr: readonly string[]): Dictionary<number> {
  return arr.reduce((p, c) => {
    p[c] = (p[c] || 0) + 1
    return p
  }, {} as Dictionary<number>)
}

// Usage: inputArr.sort(sortBy(o => 42))
export function sortBy<T>(weightSelector: (val: T) => number, reverse = false): (a: T, b: T) => number {
  if (reverse) {
    return (a, b) => weightSelector(b) - weightSelector(a)
  }

  return (a, b) => weightSelector(a) - weightSelector(b)
}

export function toggleInArray<T>(array: T[], key: T): T[] {
  if (array.includes(key)) {
    array = array.filter(o => o !== key)
  } else {
    array.push(key)
    /* eslint @typescript-eslint/require-array-sort-compare: warn */
    array.sort()
  }

  return array
}

module.exports = {
  arrayFilterUniqueInBetween,
  getOccurenceCount,
  sortBy,
  toggleInArray
}
