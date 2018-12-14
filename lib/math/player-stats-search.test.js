import test from 'ava'

const {
  applySearch,
  canSearch,
  isInLastSearchTime
} = require('./player-stats-search')

// Multiply by 1000 as JavaScript keeps now in milliseconds, not Seconds
const hunderedSecondsInMilliseconds = 100 * 1000

test('isInLastSearchTime', t => {
  t.true(isInLastSearchTime(100, hunderedSecondsInMilliseconds))
  t.true(isInLastSearchTime(85, hunderedSecondsInMilliseconds))
  t.false(isInLastSearchTime(75, hunderedSecondsInMilliseconds))
})

test('canSearch in last search', t => {
  t.true(canSearch({
    remainingSearches: 0,
    lastSearchTime: 85
  }, hunderedSecondsInMilliseconds))
})

test('canSearch out of last search', t => {
  t.false(canSearch({
    remainingSearches: 0,
    lastSearchTime: 75
  }, hunderedSecondsInMilliseconds))
})

test('canSearch attempts left and out of last search', t => {
  t.true(canSearch({
    remainingSearches: 1,
    lastSearchTime: 75
  }, hunderedSecondsInMilliseconds))
})

test('canSearch without previous search', t => {
  t.false(canSearch())
})

test('applySearch nothing changes in last search time', t => {
  const input = {
    remainingSearches: 1,
    lastSearchTime: 85
  }
  t.deepEqual(applySearch(input, hunderedSecondsInMilliseconds), input)
})

test('applySearch out of time from last search', t => {
  const input = {
    remainingSearches: 1,
    lastSearchTime: 75
  }
  t.deepEqual(applySearch(input, hunderedSecondsInMilliseconds), {
    remainingSearches: 0,
    lastSearchTime: 100
  })
})
