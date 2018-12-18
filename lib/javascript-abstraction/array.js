// See: https://stackoverflow.com/questions/13486479/how-to-get-an-array-of-unique-values-from-an-array-containing-duplicates-in-java
function filterUnique(selector = o => o) {
  return (element, index, array) => {
    return array
      .map(selector)
      .indexOf(selector(element)) >= index
  }
}

// https://stackoverflow.com/questions/22010520/sort-by-number-of-occurrencecount-in-javascript-array
function getContentOrderedByOccurenceCount(arr) {
  const occurences = arr.reduce((p, c) => {
    p[c] = (p[c] || 0) + 1
    return p
  }, {})
  const ordered = Object.keys(occurences)
    .sort((a, b) => occurences[b] - occurences[a])
  return ordered
}

module.exports = {
  filterUnique,
  getContentOrderedByOccurenceCount
}
