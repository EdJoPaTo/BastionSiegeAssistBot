import test from 'ava'

const { detectgamescreen } = require('./detectgamescreen')

const testscreens = require('./testexamples')

test('random content', t => {
  const result = detectgamescreen('666')
  t.is(result, 'unknown')
})

test('check buildings', t => testPositiveAndNegative(t, 'buildings'))
test('check trade', t => testPositiveAndNegative(t, 'resources'))


function testPositiveAndNegative(t, buildingName) {
  positiveScreenTest(t, buildingName)
  negativeScreenTest(t, buildingName)
}

function positiveScreenTest(t, buildingName) {
  const buildingEntries = testscreens.filter(o => o.type === buildingName)
  t.true(buildingEntries.length >= 1, 'test case for that building is missing')
  const text = buildingEntries[0].text

  const result = detectgamescreen(text)
  t.is(result, buildingName)
}

function negativeScreenTest(t, buildingName) {
  const buildingEntries = testscreens.filter(o => o.type !== buildingName)
  t.not(buildingEntries.length, testscreens.length)

  for (const building of buildingEntries) {
    const result = detectgamescreen(building.text)
    t.not(result, buildingName)
  }
}
