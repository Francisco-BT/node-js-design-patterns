import { createServer } from 'node:http'

import Chance from 'chance'

const CHUNCK_SIZE = 16 * 1024 - 1
const chance = new Chance()

const server = createServer((_req, res) => {
  res.writeHead(200, { 'content-type': 'text/plain' })

  let backPressureCount = 0
  let bytesSent = 0

  function generateMore() {
    do {
      const randomChunck = chance.string({ length: CHUNCK_SIZE })
      const shouldContinue = res.write(`${randomChunck}\n`)
      bytesSent += CHUNCK_SIZE

      if (!shouldContinue) {
        console.warn(`back-pressure x${backPressureCount}`)
        res.once('drain', generateMore)
      }
    } while (chance.bool({ likelihood: 95 }))

    res.end('\n\n')
  }

  generateMore()
  res.on('finish', () => console.log(`Sent ${bytesSent} bytes`))
})

server.listen(3000, () => {
  console.log('listening on http://localhost:3000')
})
