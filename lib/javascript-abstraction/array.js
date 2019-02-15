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
  getOccurenceCount,
  sortBy,
  toggleInArray
}
