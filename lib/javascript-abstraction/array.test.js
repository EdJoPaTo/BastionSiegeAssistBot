import test from 'ava'

const {
  getOccurenceCount,
  sortBy
} = require('./array')

test('getOccurenceCount example', t => {
  const input = ['A', 'B', 'B', 'C', 'D', 'B', 'D', 'A', 'B']
  t.deepEqual(getOccurenceCount(input), {
    A: 2,
    B: 4,
    C: 1,
    D: 2
  })
})

test('sortBy example', t => {
  const input = ['A', 'a', 'C', 'B']
  const expected = ['A', 'B', 'C', 'a']
  t.deepEqual(input.sort(sortBy(o => o.charCodeAt())), expected)
})

test('sortBy reverse example', t => {
  const input = ['A', 'a', 'C', 'B']
  const expected = ['a', 'C', 'B', 'A']
  t.deepEqual(input.sort(sortBy(o => o.charCodeAt(), true)), expected)
})
