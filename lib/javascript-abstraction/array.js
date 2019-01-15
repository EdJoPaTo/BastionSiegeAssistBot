// See: https://stackoverflow.com/questions/13486479/how-to-get-an-array-of-unique-values-from-an-array-containing-duplicates-in-java
function filterUnique(selector = o => o, last = false) {
  return (element, index, array) => {
    const mapped = array
      .map(selector)
    const toBeSearched = selector(element)

    if (last) {
      return mapped.lastIndexOf(toBeSearched) === index
    }
    return mapped.indexOf(toBeSearched) >= index
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

module.exports = {
  filterUnique,
  getOccurenceCount,
  sortBy
}
