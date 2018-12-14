import test from 'ava'

const {
  filterUnique
} = require('./array')

test('simple', t => {
  const data = ['a', 'b', 'a', 'c']

  const result = data.filter(filterUnique())
  t.deepEqual(result, ['a', 'b', 'c'])
})

test('with selector', t => {
  const data = [
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

  const result = data.filter(filterUnique(o => o.id))
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
