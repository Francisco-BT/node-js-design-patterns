import { createReadStream, createWriteStream } from 'node:fs'
import { pipeline } from 'node:stream'
import { randomBytes } from 'node:crypto'

import { createCompressAndEncryptIv } from './combined-streams.js'

const [, , password, source] = process.argv

const iv = randomBytes(16)
const destination = `${source}.gz.enc`

pipeline(
  createReadStream(source),
  createCompressAndEncryptIv(password, iv),
  createWriteStream(destination),
  (err) => {
    if (err) {
      console.error(err)
      process.exit(1)
    }
    console.log(`${destination} created with iv: ${iv.toString('hex')}`)
  }
)
