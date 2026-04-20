/* 6.1 Data compression efficiency: Write a command-line script that takes a file
 * as input and compresses it using the different algorithms available in the zlib
 * module (Brotli, Deflate, Gzip). You want to produce a summary table that compares
 * the algorithm’s compression time and compression efficiency on the given file.
 * Hint: This could be a good use case for the fork pattern, but remember that we
 * made some important performance considerations when we discussed it earlier in this chapter. */

import { createReadStream } from 'node:fs'
import { stat } from 'node:fs/promises'
import { pipeline } from 'node:stream/promises'
import { Transform } from 'node:stream'
import { createGzip, createBrotliCompress, createDeflate } from 'node:zlib'

const source = process.argv[2]

const bytesToMb = (bytes) => bytes / 1_000_000
const fileStats = await stat(source)

class BytesCounter extends Transform {
  constructor(options) {
    super(options)
    this.processedBytes = 0
  }

  _transform(chunk, _enc, done) {
    this.processedBytes += chunk.length

    done()
  }

  _flush(done) {
    done()
  }
}

const algorithms = [
  { name: 'Gzip', createStream: () => createGzip() },
  { name: 'Brotli', createStream: () => createBrotliCompress() },
  { name: 'Deflate', createStream: () => createDeflate() }
]
const results = []

for await (const algorithm of algorithms) {
  const bytesCounter = new BytesCounter()
  const start = performance.now()
  await pipeline(
    createReadStream(source),
    algorithm.createStream(),
    bytesCounter
  )
  const end = performance.now()

  results.push({
    Algorithm: algorithm.name,
    'Time(ms)': end - start,
    'Original size': bytesToMb(fileStats.size),
    'Compressed size': bytesToMb(bytesCounter.processedBytes),
    'Ratio(%)': (bytesCounter.processedBytes / fileStats.size) * 100
  })
}

console.table(results)
