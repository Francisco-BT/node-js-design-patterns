import { createServer } from 'node:http'

import Redis from 'ioredis' // v5.6.1
import { Level } from 'level'

const db = new Level('msgHistory', { valueEncoding: 'json' })

const redisSub = new Redis()

async function getLastId() {
  let lastId = '0-0'
  try {
    const dbId = await db.get('last-message-id')
    lastId = dbId ?? lastId
  } catch (err) {
    if (err.code !== 'LEVEL_NOT_FOUND') {
      throw err
    }
  }

  return lastId
}

async function saveLastId(id, message) {
  await Promise.all([
    db.put(`msg:${id}`, message),
    db.put('last-message-id', id)
  ])
}

async function getHistory() {
  const history = []

  for await (const [key, value] of db.iterator()) {
    if (key.startsWith('msg:')) {
      history.push(value)
    }
  }

  return history
}

async function readIncomingMessages() {
  let lastId = await getLastId()

  while (true) {
    const [[, records]] = await redisSub.xread(
      'BLOCK',
      0,
      'STREAMS',
      'chat_stream',
      lastId
    )
    for (const [recordId, [, message]] of records) {
      await saveLastId(recordId, message)
      lastId = recordId
    }
  }
}

readIncomingMessages().catch((err) =>
  console.error('Error reading incoming messages', err.message)
)

const server = createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost')

  if (url.pathname === '/history') {
    const history = await getHistory()

    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ history }))
  } else {
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end("I'm alive")
  }
}).listen(3000, () => {
  console.log('Server ready')
})
