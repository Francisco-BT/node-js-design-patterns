import { createGzip, createGunzip } from 'node:zlib'
import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
  scryptSync
} from 'node:crypto'
import { compose, Transform } from 'node:stream'

function createKey(password) {
  return scryptSync(password, 'salt', 24)
}

export function createCompressAndEncrypt(password, iv) {
  const key = createKey(password)
  const combinedStream = compose(
    createGzip(),
    createCipheriv('aes192', key, iv)
  )
  combinedStream.iv = iv

  return combinedStream
}

export function createDcryptAndDecompress(password, iv) {
  const key = createKey(password)

  return compose(createDecipheriv('aes192', key, iv), createGunzip())
}

export function createCompressAndEncryptIv(password) {
  const iv = randomBytes(16)
  const key = createKey(password)
  let ivSent = false

  const ivTransform = new Transform({
    transform(chunk, _enc, done) {
      if (!ivSent) {
        this.push(iv)
        ivSent = true
      }
      this.push(chunk)
      done()
    }
  })

  const combinedStream = compose(
    createGzip(),
    createCipheriv('aes192', key, iv),
    ivTransform
  )

  return combinedStream
}

export function createDcryptAndDecompressIv(password) {
  const key = createKey(password)
  let accumulated = Buffer.alloc(0)
  let ivCompleted = false
  let combinedStream = null

  const ivExtractor = new Transform({
    highWaterMark: 10,
    transform(chunk, _enc, done) {
      if (ivCompleted) {
        combinedStream.write(chunk)
      } else {
        accumulated = Buffer.concat([accumulated, chunk])

        if (accumulated.length >= 16) {
          ivCompleted = true

          const iv = accumulated.subarray(0, 16)
          const rest = accumulated.subarray(16)

          combinedStream = compose(
            createDecipheriv('aes192', key, iv),
            createGunzip()
          )
          combinedStream.on('data', (cleanChunk) => this.push(cleanChunk))
          combinedStream.on('error', (err) => this.destroy(err))

          if (rest.length > 0) {
            combinedStream.write(rest)
          }
        }
      }

      done()
    },

    flush(done) {
      if (combinedStream) {
        combinedStream.end()
        combinedStream.on('end', done)
      } else {
        done()
      }
    }
  })

  return ivExtractor
}
