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
// import { setTimeout } from 'node:timers/promises'

const frames = [
  `
    ( •_•)
    ( > )>🍕
  `,
  `
    (•_• )
    <( < ) 🍕
  `,
  `
    ( •_•)
    ( > )>🍕
  `,
  `
    (•_• )
    <( < ) 🍕
  `
]

class Animator extends Readable {
  constructor(options) {
    super(options)
    this.currentPosition = 0
    this.isAnimating = false
  }

  _read() {
    if (this.isAnimating) {
      return
    }

    this.isAnimating = true

    setTimeout(() => {
      const actualFrame = frames[this.currentPosition]

      this.currentPosition = (this.currentPosition + 1) % frames.length

      this.push('\x1B[2J\x1B[H' + actualFrame)
      this.isAnimating = false
    }, 200)
  }
}

const animatorStream = new Animator()
animatorStream.pipe(process.stdout)
