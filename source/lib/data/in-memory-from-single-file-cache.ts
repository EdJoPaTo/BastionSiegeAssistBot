import {writeFileSync, readFileSync} from 'fs'

import stringify from 'json-stable-stringify'

export default class InMemoryFromSingleFileCache<T> {
  public data: T

  constructor(
    private readonly _file: string,
    defaultData: any = {}
  ) {
    this.data = load(this._file, defaultData)
  }

  save(): void {
    writeFileSync(this._file, stringify(this.data, {space: 2}) + '\n', 'utf8')
  }
}

function load<T>(file: string, defaultData: T): T {
  const isArray = Array.isArray(defaultData)
  try {
    const content = JSON.parse(readFileSync(file, 'utf8'))

    if (isArray) {
      return [
        ...defaultData as any,
        ...content
      ] as any
    }

    return {
      ...defaultData,
      ...content
    }
  } catch (error) {
    if (error.code === 'ENOENT') {
      // Simply does not exist yet
      console.warn('failed loading', file, error.message)
    } else {
      console.error('failed loading', file, error)
    }

    if (isArray) {
      return [
        ...defaultData as any
      ] as any
    }

    return {
      ...defaultData
    }
  }
}
