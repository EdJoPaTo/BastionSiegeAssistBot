import test from 'ava'

const {detectGamescreen, getScreenInformation} = require('./gamescreen')

const testscreens = require('./testexamples.en')
  .concat(require('./testexamples.ru'))

test('random content detectGamescreen', t => {
  const result = detectGamescreen('666').type
  t.is(result, undefined)
})

test('random content getScreenInformation', t => {
  const result = getScreenInformation('666')
  t.deepEqual(result, {})
})

const allTypes = [...new Set(testscreens.map(o => o.type))]
const allLangs = [...new Set(testscreens.map(o => o.lang))]
allTypes.forEach(type =>
  allLangs.forEach(lang => {
    test('check type ' + type + ' in lang ' + lang, positiveAndNegativeScreenTest, type, lang)
  })
)

test('every example has a language', t => {
  t.false(allLangs.some(o => o === undefined))
})

function positiveAndNegativeScreenTest(t, screenType, lang) {
  positiveScreenTest(t, screenType, lang)
  negativeScreenTest(t, screenType, lang)
}

function positiveScreenTest(t, screenType, lang) {
  const filteredScreens = testscreens
    .filter(o => o.type === screenType)
    .filter(o => o.lang === lang)
  t.true(!screenType || filteredScreens.length >= 1, 'test case for that screen is missing')

  for (const {text} of filteredScreens) {
    const result = detectGamescreen(text)
    t.is(result.type, screenType)
    if (screenType) {
      t.is(result.lang, lang)
    }
  }
}

function negativeScreenTest(t, screenType, lang) {
  const filteredScreens = testscreens
    .filter(o => o.type !== screenType)
    .filter(o => o.lang === lang)
  t.not(filteredScreens.length, testscreens.length)

  for (const {text} of filteredScreens) {
    const result = detectGamescreen(text).type
    t.not(result, screenType)
  }
}

testscreens
  .filter(o => o.information)
  .forEach((screen, i) => {
    test(`get information from gamescreen ${i} ${screen.type} in lang ${screen.lang}`, t => {
      t.log(screen.text)
      const result = getScreenInformation(screen.text)
      t.deepEqual(result, screen.information, `${screen.type} failed`)
    })
  })
