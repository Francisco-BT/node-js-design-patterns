import { EventEmitter } from 'node:events'

export class TaskQueue extends EventEmitter {
  constructor(concurrency) {
    super()
    this.concurrency = concurrency
    this.running = 0
    this.queue = []
  }

  pushTask(task) {
    this.queue.push(task)
    process.nextTick(this.next.bind(this))
    return this
  }

  next() {
    if (this.running === 0 && this.queue.length === 0) {
      return this.emit('empty')
    }

    while (this.running < this.concurrency && this.queue.length > 0) {
      const task = this.queue.shift()
      this.running++
      ;(async () => {
        try {
          await task()
        } catch (err) {
          this.emit('taskError', err)
        } finally {
          this.running--
          this.next()
        }
      })()
    }
  }

  stats() {
    return {
      running: this.running,
      scheduled: this.queue.length
    }
  }
}

// Testing code
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

function createTask(name, durationMs, shouldFail = false) {
  return async () => {
    console.log(`⏳ [Start] Task ${name} running. (Duration: ${durationMs}ms)`)
    await delay(durationMs)

    if (shouldFail) {
      throw new Error(`¡Boom! The task ${name} blow up.`)
    }

    console.log(`✅ [END] Task ${name} endup.`)
  }
}

const queue = new TaskQueue(2)
const monitor = setInterval(() => {
  const stats = queue.stats()
  console.log(
    `📊 Current stats -> Running: ${stats.running} | Waiting: ${stats.scheduled}`
  )
}, 500)

queue.on('taskError', (err) => {
  console.log(`Error happens in the queue ${err}`)
})
queue.on('empty', () => {
  console.log('All the tasks are done')
  clearInterval(monitor)
})

console.log('--- ENQUEUE TASKS ---')
queue.pushTask(createTask('A', 1000))
queue.pushTask(createTask('B', 3000))
queue.pushTask(createTask('C', 1000, true))
queue.pushTask(createTask('D', 1000))
queue.pushTask(createTask('E', 500))
console.log('--- QUEUED TASKS ---')
