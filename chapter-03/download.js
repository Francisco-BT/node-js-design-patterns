import { EventEmitter } from 'node:events'
import { createServer, get } from 'node:http'

const DownloadEvent = {
  PROGRESS: 'progress'
}

function download(url, cb) {
  const eventEmitter = new EventEmitter()

  const req = get(url, (res) => {
    const chunks = []
    let loadedBytes = 0
    const fileSize = res.headers['content-length']

    res.on('error', (err) => {
      cb(err)
    })

    res.on('data', (chunk) => {
      chunks.push(chunk)
      loadedBytes += chunk.length
      eventEmitter.emit(DownloadEvent.PROGRESS, loadedBytes, fileSize)
    })

    res.on('end', () => {
      const data = Buffer.concat(chunks)
      cb(null, data)
    })
  })

  req.on('error', (err) => {
    cb(err)
  })

  return eventEmitter
}

const server = createServer((_req, res) => {
  // Simulate a larger file for progress tracking with chunked sending
  const totalSize = 10000000 // 10MB
  const chunkSize = 100000 // 100KB chunks
  const largeData = 'x'.repeat(totalSize)

  res.writeHead(200, {
    'Content-Type': 'text/plain',
    'Content-Length': totalSize
  })

  let offset = 0
  const sendChunk = () => {
    if (offset >= totalSize) {
      res.end()
      return
    }

    const chunk = largeData.slice(offset, offset + chunkSize)
    res.write(chunk)
    offset += chunkSize

    // Delay between chunks to see progress bar (100ms = slower, 10ms = faster)
    setTimeout(sendChunk, 50)
  }

  sendChunk()
})

server.listen(3000, () => {
  console.log('Server listening on port 3000')

  download('http://localhost:3000', (err, data) => {
    if (err) {
      console.error('Error:', err)
      server.close()
      return
    }

    console.log('Download complete:', data.length, 'bytes')
    server.close()
  }).on('progress', (loadedBytes, fileSize) => {
    // Create a fancy progress bar
    const percent = ((loadedBytes / fileSize) * 100).toFixed(2)
    const barLength = 40
    const filledLength = Math.round((barLength * loadedBytes) / fileSize)
    const emptyLength = barLength - filledLength

    const bar = '█'.repeat(filledLength) + '░'.repeat(emptyLength)
    const loadedMB = (loadedBytes / 1024 / 1024).toFixed(2)
    const totalMB = (fileSize / 1024 / 1024).toFixed(2)

    // Clear line and print progress bar
    process.stdout.write(
      `\r[${bar}] ${percent}% | ${loadedMB}MB / ${totalMB}MB`
    )

    // Add newline when complete
    if (loadedBytes === parseInt(fileSize)) {
      process.stdout.write('\n')
    }
  })
})
