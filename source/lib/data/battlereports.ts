import {mkdirSync, readdirSync, readFileSync, writeFileSync} from 'fs'

import {parseGamescreenContent, BattlereportRaw} from 'bastion-siege-logic'
import arrayFilterUnique from 'array-filter-unique'
import stringify from 'json-stable-stringify'

import {sortBy} from '../javascript-abstraction/array'

import {BattlereportAsString, BattlereportInMemory} from '../types'

import * as playerStatsDb from './playerstats-db'
import * as poweruser from './poweruser'

const FOLDER = 'persist/battlereports/'
mkdirSync(FOLDER, {recursive: true})

console.time('battlereports')
const allRaw = loadRaw()
console.timeLog('battlereports', 'loaded', allRaw.length, 'raw battlereports')
const allBattlereports = allRaw
  .map(({time, providingTgUser, text}): BattlereportInMemory | null => {
    try {
      const {battlereport} = parseGamescreenContent(text)
      if (!battlereport) {
        console.warn('Report should not be empty. Something was not read correctly. Skip it for now.', text)
        return null
      }

      return {
        ...battlereport,
        time: Number(time),
        providingTgUser
      }
    } catch (error) {
      console.warn('Failed to parse report. Skip it for now.', time, text, error)
      return null
    }
  })
  .filter(o => o) as BattlereportInMemory[]
console.timeEnd('battlereports')
console.log('battlereports: loaded', allBattlereports.length, 'battlereports')

console.time('poweruser prefill')
allBattlereports.forEach(r => poweruser.addReport(r))
console.timeEnd('poweruser prefill')

console.time('playerStatsDb')
allBattlereports.forEach(r => playerStatsDb.addReport(r))
console.timeLog('playerStatsDb', 'prefill')

// By loading the list all playerstats get precached
const playerStats = playerStatsDb.list()
console.timeLog('playerStatsDb')
console.log('playerStatsDb: loaded', playerStats.length, 'playerStats')

function getAllJsonsSync(folder: string): readonly string[] {
  const content = readdirSync(folder)
  const folders = content.filter(o => !o.includes('.'))
  const files = content.filter(o => o.endsWith('.json'))

  return [
    ...folders.flatMap(o => getAllJsonsSync(`${folder}/${o}`)),
    ...files.map(o => `${folder}/${o}`)
  ]
}

function loadRaw(): BattlereportAsString[] {
  const allFiles = getAllJsonsSync(FOLDER)
  const raws = allFiles
    .flatMap(o => loadRawFile(o))
    // Ensure there are no duplicate reports.
    // When multiple people send the same report everyone but one will lose them
    .filter(arrayFilterUnique(o => `${o.time} ${o.text}`))
    .sort(sortBy(o => o.time))

  return raws
}

function loadRawFile(file: string): readonly BattlereportAsString[] {
  try {
    const contentString = readFileSync(file, 'utf8')
    const {raw} = JSON.parse(contentString)
    return raw
  } catch (error) {
    console.error('failed to loadRaw', error)
    return []
  }
}

function filenameKeyFromTimestamp(unixTimestamp: number): string {
  const date = new Date(unixTimestamp * 1000)
  const key = `${date.getUTCFullYear()}-${date.getUTCMonth() + 1}/${date.getUTCDate()}`
  return key
}

function saveRawSpecificTimestamp(timestamp: number): void {
  const wantedKey = filenameKeyFromTimestamp(timestamp)
  const data = allRaw
    .filter(o => filenameKeyFromTimestamp(o.time) === wantedKey)

  saveRawFile(wantedKey, {raw: data})
}

function saveRawFile(key: string, data: unknown): void {
  const fullFilename = `${FOLDER}${key}.json`
  const path = fullFilename.split('/').slice(0, -1).join('/')
  mkdirSync(path, {recursive: true})

  const content = stringify(data, {space: 2}) + '\n'
  writeFileSync(fullFilename, content, 'utf8')
}

export function getAll(): readonly BattlereportInMemory[] {
  return [...allBattlereports]
}

export function add(user: number, time: number, report: BattlereportRaw, raw: string): boolean {
  const exists = allRaw
    .filter(o => o.time === time)
    .some(o => o.text === raw)

  if (exists) {
    return false // Not a new report
  }

  if (report) {
    const enrichedReport: BattlereportInMemory = {
      ...report,
      time,
      providingTgUser: user
    }

    allBattlereports.push(enrichedReport)
    playerStatsDb.addReport(enrichedReport)
    poweruser.addReport(enrichedReport)
  }

  allRaw.push({
    providingTgUser: user,
    text: raw,
    time
  })
  allRaw.sort(sortBy(o => o.time))
  saveRawSpecificTimestamp(time)

  return true // Is a new report
}
