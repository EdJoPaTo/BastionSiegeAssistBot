function average(vectorArr) {
  return {
    x: vectorArr.map(o => o.x).reduce((a, b) => a + b, 0) / vectorArr.length,
    y: vectorArr.map(o => o.y).reduce((a, b) => a + b, 0) / vectorArr.length
  }
}

function length(vector) {
  return Math.sqrt((vector.x * vector.x) + (vector.y * vector.y))
}

module.exports = {
  average,
  length
}
