import { createReadStream, createWriteStream } from 'node:fs'
import { Readable, Transform } from 'node:stream'

export function concatFiles(dest, files) {
  return new Promise((resolve, reject) => {
    const destStream = createWriteStream(dest)

    Readable.from(files)
      .pipe(
        new Transform({
          objectMode: true,
          transform(filename, _enc, done) {
            const src = createReadStream(filename)
            src.pipe(destStream, { end: false })
            src.on('error', done)
            src.on('end', done)
          }
        })
      )
      .on('error', (err) => {
        destStream.end()
        reject(err)
      })
      .on('finish', () => {
        destStream.end()
        resolve()
      })
  })
}

try {
  await concatFiles(process.argv[2], process.argv.slice(3))
} catch (error) {
  console.error(error)
  process.exit(1)
}

console.log('All files concatenated successfully')
