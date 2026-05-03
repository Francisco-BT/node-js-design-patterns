import { join } from 'node:path'

import { Level } from 'level'

export function levelSubscribe(db) {
  db.subscribe = (pattern, listener) => {
    db.on('write', (docs) => {
      for (const doc of docs) {
        const match = Object.keys(pattern).every(
          (k) => pattern[k] === doc.value[k]
        )

        if (match) {
          listener(doc.key, doc.value)
        }
      }
    })
  }

  return db
}

const dbPath = join(import.meta.dirname, 'db')
const db = new Level(dbPath, { valueEncoding: 'json' })
levelSubscribe(db)

db.subscribe({ doctype: 'message', language: 'en' }, (_k, value) =>
  console.log(`Value: `, value)
)

await db.put('1', {
  doctype: 'message',
  text: 'Hi',
  language: 'en'
})

await db.put('2', {
  doctype: 'company',
  name: 'ACME Co.'
})

await db.put('3', {
  doctype: 'message',
  language: 'en',
  test: true
})
