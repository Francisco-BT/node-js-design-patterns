/**
 * 3.3 A simple modification:
 * Modify the function created in exercise 3.2 so that it emits a tick event
 * immediately after the function is invoked.
 */
import { EventEmitter } from 'node:events'

function ticker(ms, cb) {
  const eventEmitter = new EventEmitter()
  let count = 0
  const start = Date.now()

  const tick = () => {
    const elapsed = Date.now() - start
    if (elapsed >= ms) {
      cb(count)
      return
    }

    count++
    eventEmitter.emit('tick')
    setTimeout(tick, 50)
  }

  process.nextTick(() => tick())

  return eventEmitter
}

ticker(200, (count) => {
  console.log('Done:', count)
}).on('tick', () => {
  console.log('Tick')
})
