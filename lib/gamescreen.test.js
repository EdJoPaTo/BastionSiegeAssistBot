import test from 'ava'

const {detectGamescreen, getScreenInformation} = require('./gamescreen')

const testscreens = require('./testexamples.en')

test('random content', t => {
  const result = detectGamescreen('666').type
  t.is(result, 'unknown')
})

const allTypes = [...new Set(testscreens.map(o => o.type))]
allTypes.forEach(type => {
  test('check type ' + type, positiveAndNegativeScreenTest, type)
})

function positiveAndNegativeScreenTest(t, screenType) {
  positiveScreenTest(t, screenType)
  negativeScreenTest(t, screenType)
}

function positiveScreenTest(t, screenType) {
  const filteredScreens = testscreens.filter(o => o.type === screenType)
  t.true(filteredScreens.length >= 1, 'test case for that screen is missing')

  for (const {text} of filteredScreens) {
    const result = detectGamescreen(text).type
    t.is(result, screenType)
  }
}

function negativeScreenTest(t, screenType) {
  const filteredScreens = testscreens.filter(o => o.type !== screenType)
  t.not(filteredScreens.length, testscreens.length)

  for (const {text} of filteredScreens) {
    const result = detectGamescreen(text).type
    t.not(result, screenType)
  }
}

testscreens
  .filter(o => o.information)
  .forEach((screen, i) => {
    test(`get information from gamescreen ${i} ${screen.type}`, t => {
      t.log(screen.text)
      const result = getScreenInformation(screen.text)
      t.deepEqual(result, screen.information, `${screen.type} failed`)
    })
  })
