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

function testPositiveAndNegative(t, screenType) {
  positiveScreenTest(t, screenType)
  negativeScreenTest(t, screenType)
}

function positiveScreenTest(t, screenType) {
  const filteredScreens = testscreens.filter(o => o.type === screenType)
  t.true(filteredScreens.length >= 1, 'test case for that screen is missing')

  for (const {text} of filteredScreens) {
    const result = detectgamescreen(text)
    t.is(result, screenType)
  }
}

function negativeScreenTest(t, screenType) {
  const filteredScreens = testscreens.filter(o => o.type !== screenType)
  t.not(filteredScreens.length, testscreens.length)

  for (const screen of filteredScreens) {
    const result = detectgamescreen(screen.text)
    t.not(result, screenType)
  }
}

test('get information from gamescreen', t => {
  const screensWithInfos = testscreens.filter(o => o.information)

  for (const screen of screensWithInfos) {
    const result = getScreenInformation(screen.text)
    t.deepEqual(result, screen.information, `${screen.type} failed`)
  }
})
