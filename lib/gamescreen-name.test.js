import test from 'ava'

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
