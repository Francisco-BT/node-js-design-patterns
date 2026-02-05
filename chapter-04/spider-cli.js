import { spider } from './web-spider.js'
import { TaskQueue } from './taskQueue.js'
import { spider as spiderV3 } from './spiderv3.js'
import { spider as spiderV4 } from './spiderv4.js'

const url = process.argv[2]
const maxDepth = process.argv[3] || 1
const concurrency = Number.parseInt(process.argv[4], 10) ?? null

if (!url) {
  console.error('Please provide a URL to spider')
  process.exit(1)
}

if (concurrency) {
  const spiderQueue = new TaskQueue(concurrency)
  spiderQueue.on('error', console.error)
  spiderQueue.on('empty', () => {
    console.log('Downloaded complete on finish!')
  })
  spiderV4(url, maxDepth, spiderQueue)
}

if (maxDepth > 1) {
  spiderV3(url, maxDepth, (err) => {
    if (err) {
      console.error(err)
      process.exit(1)
    }
    console.log('Downloaded complete!')
  })
}

spider(url, (err, filename, downloaded) => {
  if (err) {
    console.error(err)
    process.exit(1)
  }

  if (downloaded) {
    console.log(`Completed the download of ${url} to ${filename}`)
  } else {
    console.log(`${filename} was already downloaded.`)
  }
})
