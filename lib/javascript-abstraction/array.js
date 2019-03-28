function arrayFilterUniqueInBetween(selector = o => o) {
  // True -> stay in array and not get filtered out
  // False -> filter out

  const selected = {}

  function select(arr, i) {
    if (!selected[i]) {
      selected[i] = selector(arr[i])
    }

    return selected[i]
  }

  return (_o, i, arr) => {
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
function getOccurenceCount(arr) {
  return arr.reduce((p, c) => {
    p[c] = (p[c] || 0) + 1
    return p
  }, {})
}

// Usage: inputArr.sort(sortBy(o => 42))
function sortBy(weightSelector, reverse) {
  if (reverse) {
    return (a, b) => weightSelector(b) - weightSelector(a)
  }

  return (a, b) => weightSelector(a) - weightSelector(b)
}

function toggleInArray(array, key) {
  if (array.includes(key)) {
    array = array.filter(o => o !== key)
  } else {
    array.push(key)
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
