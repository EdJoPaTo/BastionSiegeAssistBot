import test from 'ava'

const {detectgamescreen, getScreenInformation} = require('./gamescreen')

const testscreens = require('./testexamples')

test('random content', t => {
  const result = detectgamescreen('666')
  t.is(result, 'unknown')
})

test('check main', testPositiveAndNegative, 'main')
test('check buildings', testPositiveAndNegative, 'buildings')
test('check storage', testPositiveAndNegative, 'storage')
test('check workshop', testPositiveAndNegative, 'workshop')
test('check trade', testPositiveAndNegative, 'resources')

function testPositiveAndNegative(t, buildingName) {
  positiveScreenTest(t, buildingName)
  negativeScreenTest(t, buildingName)
}

function positiveScreenTest(t, buildingName) {
  const buildingEntries = testscreens.filter(o => o.type === buildingName)
  t.true(buildingEntries.length >= 1, 'test case for that building is missing')
  const {text} = buildingEntries[0]

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

test('get information from gamescreen', t => {
  const screensWithInfos = testscreens.filter(o => o.information)

  for (const building of screensWithInfos) {
    const result = getScreenInformation(building.text)
    t.deepEqual(result, building.information, `${building.type} failed`)
  }
})
