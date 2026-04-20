import { Transform } from 'node:stream'
import { createInterface } from 'node:readline'
import { createReadStream, createWriteStream } from 'node:fs'
import { pipeline } from 'node:stream/promises'

export class ConcurrentStream extends Transform {
  constructor(userTransform, options) {
    super({ objectMode: true, ...options })
    this.userTransform = userTransform
    this.running = 0
    this.terminateCb = null
  }

  _transform(chunk, enc, done) {
    this.running++
    this.userTransform(
      chunk,
      enc,
      this.push.bind(this),
      this._onComplete.bind(this)
    )
    done()
  }

  _flush(done) {
    if (this.running > 0) {
      this.terminateCb = done
    } else {
      done()
    }
  }

  _onComplete(err) {
    this.running--

    if (err) {
      return this.emit('error', err)
    }

    if (this.running === 0) {
      this.terminateCb?.()
    }
  }
}

const inputFile = createReadStream(process.argv[2])
const fileLines = createInterface({ input: inputFile })

const checkUrls = new ConcurrentStream(async (url, _enc, push, done) => {
  if (!url) {
    return done()
  }

  try {
    await fetch(url, {
      method: 'HEAD',
      timeout: 5000,
      signal: AbortSignal.timeout(5000)
    })
    push(`${url} is up\n`)
  } catch (err) {
    push(`${url} is down: ${err}\n`)
  }
  done()
})

const outputFile = createWriteStream('results.txt')
await pipeline(fileLines, checkUrls, outputFile)
console.log('All urls have been checked')
