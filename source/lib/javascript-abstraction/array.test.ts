import test, {ExecutionContext} from 'ava'

import {
  arrayFilterUniqueInBetween,
  getOccurenceCount,
  sortBy
} from './array'

function arrayFilterUniqueInBetweenMacro<T>(t: ExecutionContext, input: readonly T[], expected: readonly T[], selector?: (o: T) => string): void {
  const filtered = input
    .filter(arrayFilterUniqueInBetween(selector))
  t.deepEqual(filtered, expected)
}

test('arrayFilterUniqueInBetween empty', arrayFilterUniqueInBetweenMacro, [], [])
test('arrayFilterUniqueInBetween single entry', arrayFilterUniqueInBetweenMacro, ['A'], ['A'])
test('arrayFilterUniqueInBetween two entries', arrayFilterUniqueInBetweenMacro, ['A', 'B'], ['A', 'B'])
test('arrayFilterUniqueInBetween two equal entries', arrayFilterUniqueInBetweenMacro, ['A', 'A'], ['A', 'A'])

test('arrayFilterUniqueInBetween equal entries', arrayFilterUniqueInBetweenMacro,
  ['A', 'A', 'A', 'A'],
  ['A', 'A']
)

test('arrayFilterUniqueInBetween example', arrayFilterUniqueInBetweenMacro,
  ['A', 'A', 'A', 'B', 'A', 'A', 'A', 'C', 'C', 'C'],
  ['A', 'A', 'B', 'A', 'A', 'C', 'C']
)

test('arrayFilterUniqueInBetween example with selector', arrayFilterUniqueInBetweenMacro,
  [{k: 'A', n: 0}, {k: 'A', n: 1}, {k: 'A', n: 2}, {k: 'B', n: 3}, {k: 'B', n: 4}, {k: 'B', n: 5}, {k: 'C', n: 6}] as any,
  [{k: 'A', n: 0}, {k: 'A', n: 2}, {k: 'B', n: 3}, {k: 'B', n: 5}, {k: 'C', n: 6}] as any,
  (o: any) => o.k
)

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
  t.deepEqual(input.sort(sortBy(o => o.charCodeAt(0))), expected)
})

test('sortBy reverse example', t => {
  const input = ['A', 'a', 'C', 'B']
  const expected = ['a', 'C', 'B', 'A']
  t.deepEqual(input.sort(sortBy(o => o.charCodeAt(0), true)), expected)
})
