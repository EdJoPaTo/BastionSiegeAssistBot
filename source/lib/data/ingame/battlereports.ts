import {addToGroupedArray} from '../../javascript-abstraction/record'

import {BattlereportInMemory} from '../../types'

const groupedByProvidingUser: Record<number, BattlereportInMemory[]> = {}
const groupedByTargetPlayername: Record<string, BattlereportInMemory[]> = {}

export function add(report: BattlereportInMemory): void {
  addToGroupedArray(groupedByProvidingUser, report.providingTgUser, report)

  for (const enemy of report.enemies) {
    addToGroupedArray(groupedByTargetPlayername, enemy, report)
  }
}

export function getByProvidingUser(user: number): readonly BattlereportInMemory[] {
  return groupedByProvidingUser[user] || []
}

export function listTargetPlayernames(): string[] {
  return Object.keys(groupedByTargetPlayername)
}

export function getByTargetPlayername(name: string): readonly BattlereportInMemory[] {
  return groupedByTargetPlayername[name] || []
}
