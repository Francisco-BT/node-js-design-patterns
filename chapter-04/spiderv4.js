import { readFile, writeFile } from 'node:fs'
import { dirname } from 'node:path'

import {
  exists,
  urlToFilename,
  getPageLinks,
  get,
  recursiveMkdir
} from './util.js'

function saveFile(filename, content, cb) {
  recursiveMkdir(dirname(filename), (err) => {
    if (err) {
      return cb(err)
    }
    writeFile(filename, content, cb)
  })
}

function download(url, filename, cb) {
  console.log(`Downloading ${url} into ${filename}`)
  get(url, (err, content) => {
    if (err) {
      return cb(err)
    }
    saveFile(filename, content, (err) => {
      if (err) {
        return cb(err)
      }
      cb(null, content)
    })
  })
}

function spiderLinks(currentUrl, body, maxDepth, queue) {
  if (maxDepth === 0) {
    return
  }
  const links = getPageLinks(currentUrl, body)
  if (links.length === 0) {
    return
  }
  for (const link of links) {
    spider(link, maxDepth - 1, queue)
  }
}

const spidering = new Set() // 1
export function spider(url, maxDepth, queue) {
  if (spidering.has(url)) {
    return
  }
  spidering.add(url)
  queue.pushTask((done) => {
    // 2
    spiderTask(url, maxDepth, queue, done)
  })
}

function spiderTask(url, maxDepth, queue, cb) {
  // 1
  const filename = urlToFilename(url)
  exists(filename, (err, alreadyExists) => {
    if (err) {
      // error checking the file
      return cb(err)
    }
    if (alreadyExists) {
      if (!filename.endsWith('.html')) {
        // ignoring non-HTML resources
        return cb()
      }
      return readFile(filename, 'utf8', (err, fileContent) => {
        if (err) {
          // error reading the file
          return cb(err)
        }
        spiderLinks(url, fileContent, maxDepth, queue) // 2
        return cb()
      })
    }
    // The file does not exist, download it
    download(url, filename, (err, fileContent) => {
      if (err) {
        // error downloading the file
        return cb(err)
      }
      // if the file is an HTML file, spider it
      if (filename.endsWith('.html')) {
        spiderLinks(url, fileContent.toString('utf8'), maxDepth, queue) // 2
        return cb()
      }
      // otherwise, stop here
      return cb()
    })
  })
}
