import {Battlereport} from 'bastion-siege-logic'

export interface BattlereportInMemory extends Battlereport {
  providingTgUser: number;
}

export interface BattlereportAsString {
  providingTgUser: number;
  time: number;
  text: string;
}
