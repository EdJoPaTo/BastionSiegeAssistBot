import {readdirSync, readFileSync, writeFileSync, mkdirSync, existsSync} from 'fs'

import arrayFilterUnique from 'array-filter-unique'
import arrayReduceGroupBy from 'array-reduce-group-by'
import stringify from 'json-stable-stringify'

export class ManyFilesStore<T> {
  private _entries: Record<string, T[]>

  constructor(
    public readonly directory: string,
    public readonly keyFunc: (entry: T) => string,
    public readonly sortFunc?: ((a: T, b: T) => number)
  ) {
    mkdirSync(directory, {recursive: true})
    const allEntries = loadAll(directory) as T[]
    this._entries = allEntries
      .reduce(arrayReduceGroupBy(keyFunc), {})
  }

  valuesOfKey(key: string): readonly T[] {
    return this._entries[key] || []
  }

  values(): T[] {
    return Object.values(this._entries).flat()
  }

  exists(entry: T): boolean {
    const key = this.keyFunc(entry)
    const stringified = stringify(entry)
    return this.valuesOfKey(key)
      .some(o => stringify(o) === stringified)
  }

  add(entry: T | readonly T[]): void {
    const entries = Array.isArray(entry) ? entry : [entry]
    const grouped = entries.reduce(arrayReduceGroupBy(this.keyFunc), {})
    for (const key of Object.keys(grouped)) {
      this._entries[key] = [
        ...this.valuesOfKey(key),
        ...grouped[key]
      ]
        .filter(arrayFilterUnique(o => stringify(o)))

      if (this.sortFunc) {
        this._entries[key].sort(this.sortFunc)
      }

      saveSubset(this.directory, key, this._entries[key])
    }
  }

  remove(entry: T | readonly T[]): void {
    const entries: T[] = Array.isArray(entry) ? entry : [entry]
    const grouped = entries.reduce(arrayReduceGroupBy(this.keyFunc), {})
    for (const key of Object.keys(grouped)) {
      const stringifiedToBeDeleted = grouped[key].map(o => stringify(o))
      this._entries[key] = this.valuesOfKey(key)
        .filter(o => !stringifiedToBeDeleted.includes(stringify(o)))

      saveSubset(this.directory, key, this._entries[key])
    }
  }
}

function readdirFilesRecursiveSync(directory: string): string[] {
  const allContent = readdirSync(directory, {withFileTypes: true})

  const allDirs = allContent.filter(o => o.isDirectory()).map(o => o.name)
  const allFiles = allContent.filter(o => o.isFile()).map(o => o.name)

  const allFilesFromSubDirs = allDirs
    .flatMap(o => readdirFilesRecursiveSync(`${directory}/${o}`))

  const filesWithPath = allFiles.map(o => `${directory}/${o}`)

  return [
    ...allFilesFromSubDirs,
    ...filesWithPath
  ]
}

function keysFromFilesystem(directory: string): string[] {
  const files = readdirFilesRecursiveSync(directory)
  const keys = files
    .filter(o => o.endsWith('.json'))
    .map(o => o.slice(directory.length + 1, -5))
  return keys
}

export function loadAll(directory: string): unknown[] {
  const allKeys = keysFromFilesystem(directory)
  return allKeys
    .flatMap(o => loadSubset(directory, o))
}

function loadSubset(directory: string, key: string): unknown[] {
  const file = `${directory}/${key}.json`
  if (!existsSync(file)) {
    return []
  }

  const content = JSON.parse(readFileSync(file, 'utf8'))
  const ofInterest = Array.isArray(content) ? content : content.raw
  return ofInterest
}

export function saveAll<T>(directory: string, allEntries: T[], keyFunc: (entry: T) => string): void {
  const grouped = allEntries
    .filter(arrayFilterUnique(o => stringify(o)))
    .reduce(arrayReduceGroupBy(keyFunc), {})

  for (const key of Object.keys(grouped)) {
    const entries = grouped[key]
    saveSubset(directory, key, entries)
  }
}

function saveSubset<T>(directory: string, key: string, entries: T[]): void {
  const filename = `${directory}/${key}.json`
  const dir = filename.split('/').slice(0, -1).join('/')
  mkdirSync(dir, {recursive: true})
  const content = JSON.stringify(entries, null, '\t')
    .replace(/\t/g, '')
    .replace(/},\n{/g, '},{')
  writeFileSync(filename, content + '\n', 'utf8')
}
