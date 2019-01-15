import test from 'ava'

const {
  filterUnique,
  getOccurenceCount,
  sortBy
} = require('./array')

test('simple', t => {
  const data = ['a', 'b', 'a', 'c']

  const result = data.filter(filterUnique())
  t.deepEqual(result, ['a', 'b', 'c'])
})

const filterUniqueTestdata = [
  {
    name: 'A',
    id: 1
  }, {
    name: 'B',
    id: 2
  }, {
    name: 'C',
    id: 1
  }, {
    name: 'D',
    id: 3
  }
]

test('with selector', t => {
  const result = filterUniqueTestdata.filter(filterUnique(o => o.id))
  t.deepEqual(result, [
    {
      name: 'A',
      id: 1
    }, {
      name: 'B',
      id: 2
    }, {
      name: 'D',
      id: 3
    }
  ])
})

test('with selector last', t => {
  const result = filterUniqueTestdata.filter(filterUnique(o => o.id, true))
  t.deepEqual(result, [
    {
      name: 'B',
      id: 2
    }, {
      name: 'C',
      id: 1
    }, {
      name: 'D',
      id: 3
    }
  ])
})

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
