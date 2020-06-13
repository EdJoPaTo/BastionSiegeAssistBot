import {Attackscout} from 'bastion-siege-logic'

export interface AttackscoutInMemory extends Attackscout {
  readonly providingTgUser: number;
  readonly time: number;
}
