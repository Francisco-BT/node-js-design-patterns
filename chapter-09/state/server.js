import { createServer } from 'node:net'

const server = createServer((socket) => {
  socket.on('error', (err) => {
    console.error('Server error', err?.message)
  })

  // Accumulate incoming data
  let buffer = Buffer.alloc(0)
  // When a chunk of data is received
  socket.on('data', (data) => {
    // Append new data to the buffer
    buffer = Buffer.concat([buffer, data])

    while (buffer.length >= 4) {
      const messageLength = buffer.readUInt32BE(0)

      if (buffer.length < 4 + messageLength) {
        // No enough data yet; wait for more
        break
      }

      // Check if we have the complete message
      const message = buffer.subarray(4, 4 + messageLength).toString('utf-8')
      // Process the message (just log it)
      console.log('Received message:', JSON.parse(message))
      // Remove the processed message from the buffer
      buffer = buffer.subarray(4 + messageLength)
    }
  })
})

server.listen(4545, () => console.log('Server started'))
