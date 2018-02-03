import test from 'ava'

const { detectgamescreen } = require('./detectgamescreen')

const testscreens = require('./testexamples')

test('random content', t => {
  const result = detectgamescreen('666')
  t.is(result, 'unknown')
})

test('check buildings', t => testPositiveAndNegative(t, 'buildings'))


function testPositiveAndNegative(t, buildingName) {
  positiveScreenTest(t, buildingName)
  negativeScreenTest(t, buildingName)
}

function positiveScreenTest(t, buildingName) {
  const buildingEntries = testscreens.filter(o => o.type === buildingName)
  t.is(buildingEntries.length, 1, 'test case for that building is missing')
  const content = buildingEntries[0].content

  const result = detectgamescreen(content)
  t.is(result, buildingName)
}

function negativeScreenTest(t, buildingName) {
  const buildingEntries = testscreens.filter(o => o.type !== buildingName)
  t.is(buildingEntries.length, testscreens.length - 1)

  for (const building of buildingEntries) {
    const result = detectgamescreen(building.content)
    t.not(result, buildingName)
  }
}
