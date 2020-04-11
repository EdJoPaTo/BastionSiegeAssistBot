import {Castle, castleGametext} from 'bastion-siege-logic'

import * as castles from '../data/castles'

function castleFormattedTimestampBegin(castle: Castle, locale: string | undefined, timeZone: string | undefined): string {
  return new Date(castles.nextSiegeAvailable(castle) * 1000).toLocaleString(locale, {
    timeZone,
    hour12: false,
    year: undefined,
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  })
}

function castleFormattedTimestampEnd(castle: Castle, locale: string | undefined, timeZone: string | undefined): string {
  return new Date(castles.nextSiegeBeginsFight(castle) * 1000).toLocaleTimeString(locale, {
    timeZone,
    hour12: false,
    hour: 'numeric',
    minute: '2-digit'
  })
}

export function castleHeader(castle: Castle, currentKeeper: string | undefined, locale: string | undefined, timeZone: string | undefined): string {
  let text = ''
  if (currentKeeper) {
    text += currentKeeper
  }

  text += '*'
  text += castleGametext(castle, locale === 'ru' ? 'ru' : 'en')
  text += '*'
  text += '\n'
  text += castleFormattedTimestampBegin(castle, locale, timeZone)
  text += ' - '
  text += castleFormattedTimestampEnd(castle, locale, timeZone)
  text += '\n'
  return text
}
