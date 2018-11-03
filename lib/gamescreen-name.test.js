import test from 'ava'

const emojiTree = require('emoji-tree')
const {parse} = require('./gamescreen-name')

test('dragon', t => {
  const dragon = '🐲Dragon'
  t.is(parse(dragon).name, dragon)
})

test('undead', t => {
  const undead = '☠️Undead army'
  t.is(parse(undead).name, undead)
})

test('simple', t => {
  const result = parse('paul')
  t.is(result.name, 'paul')
})

test('bonus', t => {
  const result = parse('🎃paul')
  t.is(result.bonus, '🎃')
  t.is(result.name, 'paul')
})

test('achievements', t => {
  const result = parse('{⛏🎖🏰}paul')
  t.is(result.achievements, '⛏🎖🏰')
  t.is(result.name, 'paul')
})

test('alliance', t => {
  const result = parse('[🌲]paul')
  t.is(result.alliance, '🌲')
  t.is(result.name, 'paul')
})

test('achievements & alliance', t => {
  const result = parse('{⛏🎖🏰}[🌲]paul')
  t.is(result.achievements, '⛏🎖🏰')
  t.is(result.alliance, '🌲')
  t.is(result.name, 'paul')
})

test('bonus & achievements & alliance', t => {
  const result = parse('🎃{⛏🎖🏰}[🌲]paul')
  t.is(result.bonus, '🎃')
  t.is(result.achievements, '⛏🎖🏰')
  t.is(result.alliance, '🌲')
  t.is(result.name, 'paul')
})

function exampleMacro(t, text, expected) {
  t.log(text)
  t.log(emojiTree(text))
  t.log(getUnicode(text))
  t.deepEqual(parse(text), expected)
}

function getUnicode(text) {
  const result = []
  for (let i = 0; i < text.length; i++) {
    result.push(text.charCodeAt(i).toString(16))
  }
  return result
}

test('zero width joiner', t => {
  // After the zombie there is a zero width joiner
  // why? no clue.
  // https://en.wikipedia.org/wiki/Zero-width_joiner
  const text = '🧟‍{⛏💎🏰🎖}[🚀]Ned'
  t.log(emojiTree(text))
  const result = parse(text)
  t.deepEqual(result, {
    bonus: '🧟',
    achievements: '⛏💎🏰🎖',
    alliance: '🚀',
    name: 'Ned'
  })
})

test('multiple emoji variant selector 1', exampleMacro, '\u26B0\uFE0F\uFE0F[🕌]Magomed', {
  bonus: '⚰',
  achievements: undefined,
  alliance: '🕌',
  name: 'Magomed'
})

test('multiple emoji variant selector 2', exampleMacro, '⚰️️[🐂]Апокалипсис', {
  bonus: '⚰',
  achievements: undefined,
  alliance: '🐂',
  name: 'Апокалипсис'
})
