import {AttackscoutInMemory} from '../../types/attackscout'

const lastAttackscoutOfUser: Record<number, AttackscoutInMemory> = {}

export function add(scout: AttackscoutInMemory): void {
  const existing = getLastAttackscoutOfUser(scout.providingTgUser)
  if (!existing || existing.time < scout.time) {
    lastAttackscoutOfUser[scout.providingTgUser] = scout
  }
}

export function getLastAttackscoutOfUser(user: number): AttackscoutInMemory | undefined {
  return lastAttackscoutOfUser[user]
}
