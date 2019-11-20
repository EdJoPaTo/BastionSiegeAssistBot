import {Attackscout} from 'bastion-siege-logic'

export interface AttackscoutInMemory extends Attackscout {
  providingTgUser: number;
  time: number;
}
