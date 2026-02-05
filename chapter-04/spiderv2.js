import { readFile, writeFile } from 'node:fs'
import { dirname } from 'node:path'

import {
  exists,
  urlToFilename,
  get,
  recursiveMkdir,
  getPageLinks
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

function spiderLinks(currentUrl, body, maxDepth, cb) {
  if (maxDepth === 0) {
    // 1
    return process.nextTick(cb)
  }
  const links = getPageLinks(currentUrl, body) // 2
  if (links.length === 0) {
    return process.nextTick(cb)
  }
  function iterate(index) {
    // 3
    if (index === links.length) {
      return cb()
    }
    spider(links[index], maxDepth - 1, (err) => {
      // 4
      if (err) {
        return cb(err)
      }
      iterate(index + 1)
    })
  }
  iterate(0) // 5
}

export function spider(url, maxDepth, cb) {
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
      // If the page was already downloaded,  read the contents and download the links
      return readFile(filename, 'utf8', (err, fileContent) => {
        if (err) {
          // error reading the file
          return cb(err)
        }
        return spiderLinks(url, fileContent, maxDepth, cb)
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
        return spiderLinks(url, fileContent.toString('utf8'), maxDepth, cb)
      }
      // otherwise, stop here
      return cb()
    })
  })
}
