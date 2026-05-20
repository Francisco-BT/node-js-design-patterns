import { DbClient } from '../dbClient'

import { createApp } from './app.js'
import { createTables } from './dbSetup'

const db = new DbClient('data/db.sqlite')
await createTables(db)
const app = await createApp(db)
app.listen({ port: 3000 })
