import {writeFileSync, readFileSync, mkdirSync, readdirSync} from 'fs'

import {Attackscout, Buildings, DomainStats, Effect, Player, Resources, Workshop} from 'bastion-siege-logic'
import arrayFilterUnique from 'array-filter-unique'
import stringify from 'json-stable-stringify'

type Dictionary<T> = {[key: string]: T}

interface PlayerHistory {
  attackscout: Entry<Attackscout>[];
  buildings: Entry<Buildings>[];
  domainStats: Entry<DomainStats>[];
  effects: Entry<Effect[]>[];
  player: Entry<Player>[];
  resources: Entry<Resources>[];
  workshop: Entry<Workshop>[];
}

interface Entry<T> {
  data: T;
  timestamp: number;
}

const KEEP_ONLY_LATEST = ['attackscout', 'effects', 'resources']

const FOLDER = 'persist/player-history/'
mkdirSync(FOLDER, {recursive: true})

const playerData: Dictionary<PlayerHistory> = {}
console.time('player history')
load()
console.timeEnd('player history')

function load(): void {
  try {
    const userIds = readdirSync(FOLDER)
      .map(o => Number(o.replace('.json', '')))

    for (const id of userIds) {
      const content = loadUser(id)

      for (const type of Object.keys(content) as (keyof PlayerHistory)[]) {
        for (const {timestamp, data} of content[type]) {
          addInternal(id, type, timestamp, data)
        }
      }
    }
  } catch (_) {
  }
}

function loadUser(userId: number): PlayerHistory {
  const file = `${FOLDER}${userId}.json`
  try {
    return JSON.parse(readFileSync(file, 'utf8'))
  } catch (error) {
    console.error('failed loading', file, error)
    return {
      attackscout: [],
      buildings: [],
      domainStats: [],
      effects: [],
      player: [],
      resources: [],
      workshop: []
    }
  }
}

function save(userId: number): void {
  const file = `${FOLDER}${userId}.json`
  const content = stringify(playerData[userId], {space: 2}) + '\n'
  writeFileSync(file, content, 'utf8')
}

export function add(userId: number, type: keyof PlayerHistory, unixTimestamp: number, data: any): void {
  addInternal(userId, type, unixTimestamp, data)
  save(userId)
}

function addInternal(userId: number, type: keyof PlayerHistory, unixTimestamp: number, data: any): void {
  if (!playerData[userId]) {
    playerData[userId] = {} as any
  }

  if (!playerData[userId][type]) {
    playerData[userId][type] = []
  }

  if (type === 'player') {
    data = {
      ...data
    }
    delete data.achievements
    delete data.bonus
  }

  const checkForKnown = [
    ...(playerData[userId][type] as Entry<unknown>[])
      .slice(-2)
      .map((o: Entry<unknown>) => o.data),
    data
  ]

  const different = checkForKnown
    .map(o => stringify(o))
    .filter(arrayFilterUnique())
    .length

  if (KEEP_ONLY_LATEST.includes(type)) {
    playerData[userId][type] = [{
      timestamp: unixTimestamp,
      data
    }]
  } else if (checkForKnown.length === 3 && different === 1) {
    // Both last values are the same so just update the timestamp of the last
    const lastIndex = playerData[userId][type].length - 1
    playerData[userId][type][lastIndex].timestamp = unixTimestamp
  } else {
    // New
    playerData[userId][type].push({
      timestamp: unixTimestamp,
      data
    })
  }
}

export function get(userId: number): PlayerHistory {
  if (!playerData[userId]) {
    playerData[userId] = {
      attackscout: [],
      buildings: [],
      domainStats: [],
      effects: [],
      player: [],
      resources: [],
      workshop: []
    }
  }

  return playerData[userId]
}

function getAsUnknown(userId: number, type: keyof PlayerHistory): Entry<unknown>[] {
  return get(userId)[type]
}

export function getAllTimestamps<Key extends keyof PlayerHistory>(userId: number, type: Key): PlayerHistory[Key] {
  return get(userId)[type] || []
}

export function getLastTimeActive(userId: number): number {
  if (!playerData[userId]) {
    return -Infinity
  }

  const keys = Object.keys(playerData[userId]) as (keyof PlayerHistory)[]
  const lastTimestamps = keys
    .flatMap(o => getAsUnknown(userId, o).slice(-1))
    .map(o => o.timestamp)

  return Math.max(...lastTimestamps)
}

module.exports = {
  add,
  getAllTimestamps,
  getLastTimeActive
}
