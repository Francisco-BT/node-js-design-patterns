/*
 * 6.4 Animations with Readable streams: Did you know you can create amazing
 * terminal animations with just Readable streams? Well, to understand what
 * we are talking about here, try to run curl parrot.live in your terminal and
 * see what happens! If you think that this is cool, why don’t you try to
 * create something similar? Hint: If you need some help with figuring out
 * how to implement this, you can check out the actual source code of parrot.
 * live by simply accessing its URL through your browser.
 * */
import { Readable } from 'node:stream'
import { setTimeout } from 'node:timers/promises'

const frames = [
  `
     /\\_/\\
    ( o.o )
     > ^ <
   [|||||||]
  `,
  `
     /\\_/\\
    ( -.- )
    / > < \\
   [|||||||]
  `,
  `
     /\\_/\\
    ( *.* )
    \\ > < /
   [|||||||]
  `,
  `
     /\\_/\\
    ( ^.^ )
     > ^ <
   [|||||||]
  `
]

async function* animation() {
  let currentPosition = 0
  while (true) {
    await setTimeout(200)
    const actualFrame = frames[currentPosition]

    currentPosition = (currentPosition + 1) % frames.length
    yield `\x1B[2J\x1B[H${actualFrame}`
  }
}

Readable.from(animation()).pipe(process.stdout)
