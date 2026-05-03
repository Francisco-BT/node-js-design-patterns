import { join } from 'node:path'

import { Level } from 'level'

import { createFSAdapter } from './fs-adapter.js'

const db = new Level(join(import.meta.dirname, 'db'), {
  valueEncoding: 'binary'
})

const fs = createFSAdapter(db)
await fs.writeFile('file.txt', 'Hello!', 'utf8')
const res = await fs.readFile('file.txt', 'utf8')
console.log(res)

await fs.readFile('missing.txt')
