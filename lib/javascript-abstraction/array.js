// See: https://stackoverflow.com/questions/13486479/how-to-get-an-array-of-unique-values-from-an-array-containing-duplicates-in-java
function filterUnique(selector = o => o) {
  return (element, index, array) => {
    return array
      .map(selector)
      .indexOf(selector(element)) >= index
  }
}

module.exports = {
  filterUnique
}
