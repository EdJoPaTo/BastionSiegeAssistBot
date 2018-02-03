import test from 'ava'

const { detectgamescreen } = require('./detectgamescreen')

const testscreens = [
  {
    type: 'buildings',
    content: `Buildings

🏤   342⛔️
🏚   476⛔️ 4760/4760👥
🏘   484⛔️ 9680/9680👥
🌻   100​✅ 1000/1000👥
🌲    63​✅   630/630👥
⛏    63​✅   630/630👥
🛡   125⛔️ 5000/5000⚔️
🏰    80⛔️   800/800🏹

What will we build?`
  }
]

test('something random', t => {
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
  t.is(buildingEntries.length, 1)
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
