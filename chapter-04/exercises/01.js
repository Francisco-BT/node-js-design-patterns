/**
 * 1. File concatenation: Write the implementation of concatFiles(), a callback-style function that
 * takes two or more paths to text files in the filesystem and a destination file:
 */
import { appendFile, readFile, writeFile } from 'node:fs'
import { join } from 'node:path'

function concatFiles(dest, cb, ...files) {
  const destPath = join(import.meta.dirname, dest)

  if (files.length === 0) {
    return process.nextTick(() => cb(new Error('No files to concatenate')))
  }

  writeFile(destPath, '', (err) => {
    if (err) {
      return cb(err)
    }
    iterate(0)
  })

  function iterate(index) {
    if (index === files.length) {
      return cb(null)
    }

    const filePath = join(import.meta.dirname, files[index])

    readFile(filePath, 'utf-8', (err, data) => {
      if (err) {
        return cb(err)
      }

      console.log('Appending', data)
      appendFile(destPath, data + '\n', (err) => {
        if (err) {
          return cb(err)
        }
        iterate(index + 1)
      })
    })
  }
}

concatFiles(
  'result.txt',
  (err) => {
    if (err) {
      console.error(err)
      return
    }
    console.log('Concatenation complete!')
  },
  './bar.txt',
  './foo.txt',
  './zoo.txt'
)
