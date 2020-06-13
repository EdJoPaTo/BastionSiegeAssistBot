import {parseGamescreen, Gamescreen} from 'bastion-siege-logic'

import * as castles from '../castles'
import * as castleSiege from '../castle-siege'

import {isEmptyContent} from './failed-bs-messages'
import * as attackscouts from './attackscouts'
import * as battlereports from './battlereports'
import * as messages from './messages'

export interface AnalysedGamescreen {
  readonly screen: Gamescreen;
  readonly isNewBattlereport?: boolean;
}

export async function parseAndSave(providingTgUser: number, time: number, text: string): Promise<AnalysedGamescreen> {
  const raw = {providingTgUser, text, time}

  try {
    const content = parseGamescreen(text, time)

    const isNewBattlereport = content.battlereport && !messages.battlereports.exists(raw)
    if (content.battlereport && isNewBattlereport) {
      messages.battlereports.add(raw)
      battlereports.add({
        ...content.battlereport,
        time,
        providingTgUser
      })
    }

    if (content.attackscout) {
      messages.attackscouts.add(raw)
      attackscouts.add({
        ...content.attackscout,
        providingTgUser,
        time
      })
    }

    if (content.type === 'rankingGold') {
      messages.goldrankings.add(raw)
    }

    if (content.castle) {
      if (content.castleSiegeAllianceJoined) {
        await castleSiege.add(content.castle, content.castleSiegeAllianceJoined.alliance, undefined, content.timestamp)
      }

      if (content.castleSiegePlayerJoined) {
        const {alliance, name} = content.castleSiegePlayerJoined
        await castleSiege.add(content.castle, alliance!, name, content.timestamp)
      }

      if (content.castleSiegeEnds) {
        await castles.siegeEnded(content.castle, content.ingameTimestamp, content.castleSiegeEnds.newAlliance)
      }
    }

    if (isEmptyContent(content)) {
      // BastionSiege message content could not be determined
      throw new Error('could not read Bastion Siege screen')
    }

    return {
      screen: content,
      isNewBattlereport
    }
  } catch (error) {
    messages.failed.add(raw)
    throw error
  }
}
