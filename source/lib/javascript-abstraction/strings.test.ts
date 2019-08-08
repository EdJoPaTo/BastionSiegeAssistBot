import test from 'ava'

import {compareStrAsSimpleOne} from './strings'

test('compareStrAsSimpleOne same', t => {
  t.is(compareStrAsSimpleOne('hey there', 'hey there'), 0)
})

test('compareStrAsSimpleOne markdown fat is ignored -> same', t => {
  t.is(compareStrAsSimpleOne('hey there', 'hey *there*'), 0)
})

test('compareStrAsSimpleOne different', t => {
  t.not(compareStrAsSimpleOne('hey there', 'hey you'), 0)
})
