import test from 'ava'

import {emoji} from './output-text'

import {
  createMaterialStatString
} from './buildings'

test('needed material string only gold', t => {
  const cost = {gold: 100, wood: 0, stone: 0}

  t.is(createMaterialStatString(cost), `100${emoji.gold}`)
})

test('needed material string gold and stone', t => {
  const cost = {gold: 100, wood: 0, stone: 200}
  t.is(createMaterialStatString(cost), `100${emoji.gold} 200${emoji.stone}`)
})

test('needed material everything', t => {
  const cost = {gold: 100, wood: 300, stone: 200}
  t.is(createMaterialStatString(cost), `100${emoji.gold} 300${emoji.wood} 200${emoji.stone}`)
})
