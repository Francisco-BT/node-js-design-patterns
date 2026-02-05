/**
 * 3.4 Playing with errors: Modify the function created in exercise 3.3 so that it
 * produces an error if the timestamp at the moment of a tick (including the initial one
 * that we added as part of exercise 3.3) is divisible by 5. Propagate the error using both
 * the callback and the event emitter. Hint: use Date.now() to get the timestamp and the
 * remainder (%) operator to check whether the timestamp is divisible by 5.
 */
import { EventEmitter } from 'node:events'

function ticker(ms, cb) {
  const eventEmitter = new EventEmitter()
  let count = 0
  const start = Date.now()

  const tick = () => {
    const now = Date.now()
    if (now % 5 === 0) {
      const err = new Error('Timestamp is divisible by 5')
      eventEmitter.emit('error', err)
      return cb(err)
    }

    const elapsed = Date.now() - start
    if (elapsed >= ms) {
      cb(null, count)
      return
    }

    count++
    eventEmitter.emit('tick')
    setTimeout(tick, 50)
  }

  process.nextTick(() => tick())

  return eventEmitter
}

ticker(200, (err, count) => {
  if (err) {
    console.error('Error:', err)
    return
  }
  console.log('Done:', count)
})
  .on('tick', () => {
    console.log('Tick')
  })
  .on('error', (err) => {
    console.error('Event error:', err)
  })
