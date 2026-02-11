/**
 * 2. List files recursively: Write listNestedFiles(), a callback-style function that takes,
 * as the input, the path to a directory in the local filesystem and that asynchronously iterates
 * over all the subdirectories to eventually return a list of all the files discovered. Here is what
 * the signature of the function should look like:
 */
import { readdir, stat } from 'node:fs'
import { join } from 'node:path'

function listNestedFiles(dirPath, cb) {
  const finalFiles = []
  let pending = 0

  const decreasePending = () => {
    pending--
    if (pending === 0) {
      cb(null, finalFiles)
    }
  }

  const scan = (currentPath) => {
    pending++
    readdir(currentPath, (err, files) => {
      if (err) {
        return cb(err)
      }

      if (files.length === 0) {
        return decreasePending()
      }

      files.forEach((file) => {
        const fullPath = join(currentPath, file)

        pending++
        stat(fullPath, (err, stats) => {
          if (err) {
            return cb(err)
          }

          if (stats.isDirectory()) {
            scan(fullPath)
          } else {
            finalFiles.push(fullPath)
          }

          decreasePending()
        })
      })

      decreasePending()
    })
  }

  scan(dirPath)
}

listNestedFiles(
  '/Users/fbernabe/Projects/mine/node-js-desing-patterns/chapter-04/',
  (err, files) => {
    if (err) return console.error('Error:', err)
    console.log(`Encontrados ${files.length} archivos:`)
    console.log(files)
  }
)
