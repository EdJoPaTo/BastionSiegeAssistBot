const {writeFileSync, readFileSync} = require('fs')

const stringify = require('json-stable-stringify')

class InMemoryFromSingleFileCache {
  constructor(file, defaultData = {}) {
    this.file = file
    this.data = load(file, defaultData)
  }

  save() {
    writeFileSync(this.file, stringify(this.data, {space: 2}) + '\n', 'utf8')
  }
}

function load(file, defaultData) {
  const isArray = Array.isArray(defaultData)
  try {
    const content = JSON.parse(readFileSync(file))

    if (isArray) {
      return [
        ...defaultData,
        ...content
      ]
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
        ...defaultData
      ]
    }

    return {
      ...defaultData
    }
  }
}

module.exports = InMemoryFromSingleFileCache
