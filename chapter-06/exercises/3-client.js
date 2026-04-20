import { createConnection } from 'node:net'
import { createReadStream } from 'node:fs'

import { createCompressAndEncryptIv } from '../combined-streams.js'

const files = process.argv.slice(2)

function mux(stream, channelId, socket) {
  return new Promise((resolve, reject) => {
    stream.on('data', (chunk) => {
      const packet = Buffer.alloc(5)
      packet.writeUInt8(channelId, 0)
      packet.writeUInt32BE(chunk.length, 1)
      const finalBuffer = Buffer.concat([packet, chunk])

      socket.write(finalBuffer)
    })

    stream.on('end', () => {
      const eofPacket = Buffer.alloc(5)
      eofPacket.writeUInt8(channelId, 0)
      eofPacket.writeUInt32BE(0, 1)

      socket.write(eofPacket)

      resolve()
    })

    stream.on('error', reject)
  })
}

const socket = createConnection(3000, async () => {
  console.log('client ready')
  let id = 1
  const process = []

  for (const file of files) {
    console.log(`Processing file ${file}`)
    const stream = createReadStream(file).pipe(
      createCompressAndEncryptIv('mysupersecretpassword')
    )
    process.push(mux(stream, id++, socket))
  }

  try {
    await Promise.all(process)
    console.log(`All the files have been processed, closing...`)
    socket.end()
  } catch (err) {
    console.log(`Something went wrong: `, err)
    socket.destroy()
  }
})
