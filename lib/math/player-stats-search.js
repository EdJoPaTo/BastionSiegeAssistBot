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

  return remainingSearches > 0
}

function applySearch({remainingSearches, lastSearchTime} = {}, now = Date.now()) {
  if (!remainingSearches && remainingSearches !== 0) {
    remainingSearches = 0
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
  MAX_SEARCHES,
  MAX_SECONDS_FOR_ONE_SEARCH,
  applySearch,
  canSearch,
  isInLastSearchTime,
  newSearchLimitAfterReward
}
