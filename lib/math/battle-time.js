function nextBattleTimestamp(battleSoloTimestamp = 0, battleAllianceTimestamp = 0, karma = 0) {
  const lastAttackTimestamp = Math.max(battleSoloTimestamp || 0, battleAllianceTimestamp || 0)
  const minutesTillNextSoloAttack = karma < 0 ? 5 : 10

  const nextAttack = lastAttackTimestamp + (60 * minutesTillNextSoloAttack)
  const nextAllianceAttackAvailable = battleAllianceTimestamp + (60 * 60)

  return {
    alliance: Math.max(nextAttack, nextAllianceAttackAvailable),
    solo: nextAttack
  }
}

module.exports = {
  nextBattleTimestamp
}
