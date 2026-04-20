import { Transform } from 'node:stream'

export class ReplaceStream extends Transform {
  constructor(searchStr, replaceStr, options) {
    super({ ...options })
    this.searchStr = searchStr
    this.replaceStr = replaceStr
    this.tail = ''
  }

  _transform(chunck, _encoding, cb) {
    const pieces = (this.tail + chunck).split(this.searchStr)
    const lastPiece = pieces[pieces.length - 1]
    const tailLen = this.searchStr.length - 1

    this.tail = lastPiece.slice(-tailLen)
    pieces[pieces.length - 1] = lastPiece.slice(0, -tailLen)
    this.push(pieces.join(this.replaceStr))
    cb()
  }

  _flush(cb) {
    this.push(this.tail)
    cb()
  }
}

const replaceStream = new ReplaceStream('World', 'Node.js')
// replaceStream.on('data', (chunck) => process.stdout.write(chunck.toString()))
// replaceStream.write('Hello W')
// replaceStream.write('orld!')
// replaceStream.end('\n')
process.stdin.pipe(replaceStream).pipe(process.stdout)
console.log(
  'Escribe algo y presiona Enter. (Presiona Ctrl+D o Ctrl+C para salir)'
)
