/*
 * 8.4 Virtual filesystem: Modify our LevelDB filesystem adapter example to
 * write the file data in memory rather than in LevelDB. You can use an object
 * or a Map instance to store the key-value pairs of filenames and the associated data.
 * */
import { resolve } from 'node:path'

export function createFSAdapter() {
  const files = new Map()

  return {
    async readFile(filename, _options = undefined) {
      const resolvedFilename = resolve(filename)
      const value = files.get(resolvedFilename)

      if (typeof value === 'undefined') {
        const e = new Error(
          `ENOENT: no such file or directory open ${filename}`
        )
        e.code = 'ENOENT'
        e.errno = 34
        e.path = filename

        throw e
      }

      return value
    },
    async writeFile(filename, contents, _options = undefined) {
      files.set(resolve(filename), contents)
    }
  }
}

const fs = createFSAdapter()
await fs.writeFile('file.txt', 'Hello!', 'utf8')
const res = await fs.readFile('file.txt', 'utf8')
console.log(res)

await fs.readFile('missing.txt')
