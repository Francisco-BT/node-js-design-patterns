import { createReadStream, createWriteStream } from 'node:fs'
import { createGzip } from 'node:zlib'

const fileName = process.argv[2]

createReadStream(fileName)
  .pipe(createGzip())
  .pipe(createWriteStream())
  .on('finish', () => console.log('File successfully compresed'))
