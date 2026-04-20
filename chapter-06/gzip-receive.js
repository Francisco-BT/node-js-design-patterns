import { createServer } from 'node:http'
import { createWriteStream } from 'node:fs'
import { createGunzip } from 'node:zlib'
import { basename, join } from 'node:path'
import { createDecipheriv, randomBytes } from 'node:crypto'

const secret = randomBytes(24)
console.log(`Generated secret: ${secret.toString('hex')}`)

const server = createServer((req, res) => {
  const filename = basename(req.headers['x-filename'])
  const iv = Buffer.from(req.headers['x-initialization-vector'], 'hex')
  const destFileName = join(import.meta.dirname, 'received_files', filename)

  console.log(`File request received: ${filename}`)

  req
    .pipe(createDecipheriv('aes192', secret, iv))
    .pipe(createGunzip())
    .pipe(createWriteStream(destFileName))
    .on('error', (err) => console.log('error receiving file', err))
    .on('finish', () => {
      res.writeHead(201, { 'content-type': 'text-plain' })
      res.end('OK\n')
      console.log('File saved: ', destFileName)
    })
})

const PORT = 3000
server.listen(PORT, () => console.log(`Listening on http://localhost:${PORT}`))
