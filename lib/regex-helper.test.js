import test from 'ava'

const {get, getNumber} = require('./regex-helper')

test('get successful', t => {
  const result = get('was das denn?', /was (\S+)/)
  t.is(result, 'das')
})

test('get undefined', t => {
  const result = get('was das denn?', /was (\d+)/)
  t.is(result, undefined)
})

test('get specific group', t => {
  const result = get('was das denn?', /(\w+) (\w+) (\w+)?/, 3)
  t.is(result, 'denn')
})

test('getNumber successful', t => {
  const result = getNumber('40€', /(\d+)€/)
  t.is(result, 40)
})

test('getNumber 0', t => {
  const result = getNumber('0€', /(\d+)€/)
  t.is(result, 0)
})

test('getNumber unsuccessful', t => {
  const result = getNumber('null€', /(\d+)€/)
  t.is(result, undefined)
})
