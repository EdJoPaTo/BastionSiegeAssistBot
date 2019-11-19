import {parseGamescreen, Gamescreen} from 'bastion-siege-logic'

import {isEmptyContent} from './failed-bs-messages'
import * as battlereports from './battlereports'
import * as messages from './messages'

export interface AnalysedGamescreen {
  screen: Gamescreen;
  isNewBattlereport?: boolean;
}

export function parseAndSave(providingTgUser: number, time: number, text: string): AnalysedGamescreen {
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
