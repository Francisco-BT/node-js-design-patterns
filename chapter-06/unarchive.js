import { createReadStream, createWriteStream } from 'node:fs'
import { pipeline } from 'node:stream'

import { createDcryptAndDecompressIv } from './combined-streams.js'

const [, , password, ivHex, source, destination] = process.argv

const iv = Buffer.from(ivHex, 'hex')

pipeline(
  createReadStream(source, { highWaterMark: 5 }),
  createDcryptAndDecompressIv(password),
  createWriteStream(destination),
  (err) => {
    if (err) {
      console.error(err)
      process.exit(1)
    }
    console.log(`File decompressed`)
  }
)
