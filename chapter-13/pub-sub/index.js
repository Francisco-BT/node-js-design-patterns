import { createServer } from 'node:http'

import { WebSocketServer } from 'ws'
import staticHandler from 'serve-handler'
import Redis from 'ioredis'

const redisPub = new Redis()
const redisSub = new Redis()

// serve static files
const server = createServer((req, res) => {
  return staticHandler(req, res, { public: 'web' })
})

const wss = new WebSocketServer({ server })
wss.on('connection', (client) => {
  console.log('Client connected')

  client.on('message', (message) => {
    console.log(`Sending message to redis: ${message}`)
    redisPub.publish('chat_message', message)
  })
})

redisSub.subscribe('chat_message')
redisSub.on('message', (channel, message) => {
  if (channel === 'chat_message') {
    console.log(`Received message from Redis: ${message}`)

    for (const client of wss.clients) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(Buffer.from(message))
      }
    }
  }
})

server.listen(process.argv[2] || 8080)
