/**
 * 3. Recursive find: Write recursiveFind(), a callback-style function that takes a path to a
 * directory in the local filesystem and a keyword, as per the following signature:
 */
import { readdir, readFile, stat } from 'node:fs'
import { join } from 'node:path'

function recursiveFind(dir, keyword, cb) {
  const matchedFiles = []
  let pending = 0

  const decreasePending = () => {
    pending--
    if (pending === 0) {
      cb(null, matchedFiles)
    }
  }

  const search = (currentPath) => {
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
            search(fullPath)
          } else {
            pending++
            readFile(fullPath, 'utf8', (err, content) => {
              if (err) {
                return cb(err)
              }

              if (content.includes(keyword)) {
                matchedFiles.push(fullPath)
              }

              decreasePending()
            })
          }

          decreasePending()
        })
      })

      decreasePending()
    })
  }

  search(dir)
}

recursiveFind(
  '/Users/fbernabe/Projects/mine/node-js-desing-patterns/chapter-04/',
  'batman',
  (err, files) => {
    if (err) {
      console.error('Error:', err)
      return
    }
    console.log(`Encontrados ${files.length} archivos:`)
    console.log(files)
  }
)

export { recursiveFind }
