import { hostname } from 'node:os'

import { FailSafeSocket } from './failSafeSocket.js'

const clientId = `${hostname()}@${process.pid}`
console.log(`Starting client ${clientId}`)

const failSafeSocket = new FailSafeSocket({ port: 4545 })
setInterval(() => {
  // constructs the message
  const messageData = Buffer.from(
    JSON.stringify({
      ts: Date.now(),
      client: clientId,
      mem: process.memoryUsage()
    }),
    'utf-8'
  )
  // creates a 4-byte buffer to store the message length
  const messageLength = Buffer.alloc(4)
  messageLength.writeUInt32BE(messageData.length, 0)
  // concatenates the message length and message data
  const message = Buffer.concat([messageLength, messageData])
  // sends the message
  failSafeSocket.send(message)
}, 5000)
