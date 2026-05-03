import { createWriteStream } from 'node:fs'

export function createLoggingWritable(writable) {
  return new Proxy(writable, {
    get(target, propKey, _receiver) {
      if (propKey === 'write') {
        return (...args) => {
          const [chunk] = args
          console.log('Writing: ', chunk)

          return writable.write(...args)
        }
      }

      return target[propKey]
    }
  })
}

const writable = createWriteStream('test.txt')
const writableProxy = createLoggingWritable(writable)
writableProxy.write('First chunk')
writableProxy.write('Second chunk')
writable.write('This is not logged')
writableProxy.end()
