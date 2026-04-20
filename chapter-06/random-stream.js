import { Readable } from 'node:stream'

import Chance from 'chance'

const chance = new Chance()

export class RandomStream extends Readable {
  constructor(options) {
    super(options)
    this.emittedBytes = 0
  }

  _read(size) {
    const chunck = chance.string({ length: size })
    this.push(chunck, 'utf8')
    this.emittedBytes += chunck.length

    if (chance.bool({ likelihood: 5 })) {
      this.push(null)
    }
  }
}

const randomStream = new RandomStream()

randomStream
  .on('data', (chunck) => {
    console.log(
      `Chunck received (${chunck.length} bytes): ${chunck.toString()}`
    )
  })
  .on('end', () => {
    console.log(`Produced ${randomStream.emittedBytes} bytes of random data`)
  })
