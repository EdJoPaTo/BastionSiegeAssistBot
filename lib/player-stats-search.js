const FREE_SEARCHES = 3
const MAX_SEARCHES = 10
const MAX_SECONDS_FOR_ONE_SEARCH = 20

function isInLastSearchTime(lastSearchTime, now) {
  return lastSearchTime + MAX_SECONDS_FOR_ONE_SEARCH >= now / 1000
}

function canSearch({remainingSearches, lastSearchTime} = {}, now = Date.now()) {
  const inLastSearchTime = isInLastSearchTime(lastSearchTime, now)
  if (inLastSearchTime) {
    return true
  }
  if (remainingSearches === 0) {
    return false
  }
  return true
}

function applySearch({remainingSearches, lastSearchTime} = {}, now = Date.now()) {
  if (!remainingSearches && remainingSearches !== 0) {
    remainingSearches = FREE_SEARCHES
  }
  if (!isInLastSearchTime(lastSearchTime, now)) {
    remainingSearches -= 1
    lastSearchTime = now / 1000
  }

  return {
    remainingSearches,
    lastSearchTime
  }
}

function newSearchLimitAfterReward(oldLimit, rewardWorth) {
  return Math.min((oldLimit || 0) + rewardWorth, MAX_SEARCHES)
}

module.exports = {
  FREE_SEARCHES,
  MAX_SEARCHES,
  MAX_SECONDS_FOR_ONE_SEARCH,
  applySearch,
  canSearch,
  isInLastSearchTime,
  newSearchLimitAfterReward
}
