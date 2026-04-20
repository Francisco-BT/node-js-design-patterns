import { createServer } from 'node:net'
import { createWriteStream } from 'node:fs'

import { createDcryptAndDecompressIv } from '../combined-streams.js'

function demux(socket) {
  const destinations = new Map()

  let currentChannel = null
  let currentLength = null

  socket.on('readable', () => {
    let chunk

    while (true) {
      if (currentLength === null) {
        chunk = socket.read(5)

        if (chunk === null) {
          return null
        }

        currentChannel = chunk.readUInt8(0)
        currentLength = chunk.readUInt32BE(1)

        console.log('[DEBUG]: currentChannel if:', currentChannel)
        console.log('[DEBUG]: currentLength if:', currentLength)
      } else {
        if (currentLength === 0) {
          console.log(`El cannal ${currentChannel} ha terminado`)

          destinations.get(currentChannel)?.end?.()
        } else {
          chunk = socket.read(currentLength)
          console.log('[DEBUG]: currentChannel else: ', currentChannel)
          console.log('[DEBUG]: currentLength else: ', currentLength)
          if (chunk === null) {
            return
          } else {
            let stream = destinations.get(currentChannel)

            if (!stream) {
              stream = createDcryptAndDecompressIv('mysupersecretpassword')
              stream.pipe(createWriteStream(`file_${currentChannel}.txt`))

              destinations.set(currentChannel, stream)
            }

            stream.write(chunk)
          }
        }

        currentChannel = null
        currentLength = null
      }
    }
  })
}

const server = createServer(async (socket) => {
  console.log(`On server received socket: ${socket}`)
  demux(socket)
})

server.on('error', (err) => {
  console.log('error in server: ', err)
})

server.listen(3000, () => {
  console.log('server is ready and waiting')
})
