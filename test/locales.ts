import test from 'ava'

import {I18n} from '@edjopato/telegraf-i18n'

const i18n = new I18n({
  directory: 'locales'
})

for (const l of i18n.availableLocales()) {
  test(`locale ${l} is not overspecified`, t => {
    t.deepEqual(i18n.overspecifiedKeys(l), [])
  })
}
