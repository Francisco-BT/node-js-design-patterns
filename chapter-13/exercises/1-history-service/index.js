/*
 * 13.1 History service with streams: In our publish/subscribe example with Redis
 * streams, we didn’t need a history service (as we did in the related AMQP example)
 * because all the message history was saved in the stream anyway. Now, implement
 * such a history service, storing all the incoming messages in a separate database,
 * and use this service to retrieve the chat history when a new client connects.
 * Hint: The history service will need to remember the ID of the last message
 * retrieved across restarts.
 * */
import { createServer } from 'node:http'

import Redis from 'ioredis' // v5.6.1
import staticHandler from 'serve-handler' // v6.1.6
import { WebSocketServer } from 'ws' // v8.18.2

const redisPub = new Redis()
const redisSub = new Redis()

// serve static files
const server = createServer((req, res) => {
  return staticHandler(req, res, { public: 'web' })
})

const wss = new WebSocketServer({ server })
wss.on('connection', async (client) => {
  console.log('Client connected')

  try {
    const res = await fetch('http://localhost:3000/history')

    if (res.ok) {
      const { history } = await res.json()

      for (const message of history) {
        client.send(message)
      }
    }
  } catch (err) {
    console.error('History service is down: ', err.message)
  }

  client.on('message', (msg) => {
    console.log(`Sending message to Redis: ${msg}`)
    redisPub.xadd('chat_stream', '*', 'message', msg)
  })
})

async function processMessages() {
  let lastRecordId = '$'

  while (true) {
    const [[, records]] = await redisSub.xread(
      'BLOCK',
      0,
      'STREAMS',
      'chat_stream',
      lastRecordId
    )

    for (const [recordId, [, message]] of records) {
      for (const client of wss.clients) {
        if (client.readyState === WebSocket.OPEN) {
          client.send(message)
        }
      }
      lastRecordId = recordId
    }
  }
}

processMessages().catch((err) => console.error(err))

server.listen(process.argv[2] || 8080)
