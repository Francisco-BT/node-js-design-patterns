import { Writable } from 'node:stream'
import { promises as fs } from 'node:fs'
import { dirname, join } from 'node:path'

import { mkdirp } from 'mkdirp'

export class ToFileStream extends Writable {
  constructor(options) {
    super({ ...options, objectMode: true })
  }

  _write(chunck, _encoding, cb) {
    mkdirp(dirname(chunck.path))
      .then(() => fs.writeFile(chunck.path, chunck.content))
      .then(() => cb())
      .catch(cb)
  }
}

const tfs = new ToFileStream()
const outdir = join(import.meta.dirname, 'files')
tfs.write({ path: join(outdir, 'file1.txt'), content: 'Hello' })
tfs.write({ path: join(outdir, 'file2.txt'), content: 'Node.js' })
tfs.write({ path: join(outdir, 'file3.txt'), content: 'streams' })
tfs.end(() => console.log('All files created'))
