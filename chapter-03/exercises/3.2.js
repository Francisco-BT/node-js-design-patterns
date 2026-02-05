/**
 * 3.2  Ticker: Write a function that accepts a number and a callback as the arguments.
 * The function will return an EventEmitter that emits an event called tick every 50 milliseconds
 * until the number of milliseconds is passed from the invocation of the function. The function
 * will also call the callback when the number of milliseconds has passed, providing, as the result,
 * the total count of tick events emitted. Hint: you can use setTimeout() to schedule another
 * setTimeout() recursively.
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

  setTimeout(tick, 50)

  return eventEmitter
}

ticker(200, (count) => {
  console.log('Done:', count)
}).on('tick', () => {
  console.log('Tick')
})
