import {Battlereport} from 'bastion-siege-logic'

export interface BattlereportInMemory extends Battlereport {
  readonly providingTgUser: number;
}
