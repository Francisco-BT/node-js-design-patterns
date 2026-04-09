/**
 * 5.3 Producer-consumer with promises: Update the TaskQueuePC class internal
 * methods so that they use just promises, removing any use of the async/await syntax.
 * Hint: the infinite loop must become an asynchronous recursion.
 * Beware of the recursive Promise resolution memory leak!
 * */
export class TaskQueuePC {
  constructor(concurrency) {
    this.taskQueue = []
    this.consumerQueue = []

    // spawn consumers
    for (let i = 0; i < concurrency; i++) {
      this.consumer()
    }
  }

  consumer() {
    const self = this
    ;(function loop() {
      self
        .getNextTask()
        .then((task) => task())
        .then(() => loop())
        .catch((err) => {
          console.error(err)
          loop()
        })
    })()
  }

  getNextTask() {
    return new Promise((resolve) => {
      if (this.taskQueue.length !== 0) {
        return resolve(this.taskQueue.shift())
      }
      this.consumerQueue.push(resolve)
    })
  }

  runTask(task) {
    return new Promise((resolve, reject) => {
      const taskWrapper = () => {
        const taskPromise = task()
        taskPromise.then(resolve, reject)
        return taskPromise
      }

      if (this.consumerQueue.length !== 0) {
        // there is a sleeping consumer available, use it to run our task
        const consumer = this.consumerQueue.shift()
        consumer(taskWrapper)
      } else {
        // all consumers are busy, enqueue the task
        this.taskQueue.push(taskWrapper)
      }
    })
  }
}

// Test code
const delay = (ms) => new Promise((res) => setTimeout(res, ms))

function createTask(name, ms, shouldFail = false) {
  return () => {
    console.log(`⏳ [INICIO] Tarea ${name} (${ms}ms)`)
    return delay(ms).then(() => {
      if (shouldFail) throw new Error(`¡Boom! Tarea ${name} falló`)
      console.log(`✅ [FIN] Tarea ${name}`)
      return `Éxito: ${name}`
    })
  }
}

const queue = new TaskQueuePC(2) // Concurrencia de 2

console.log('--- ENCOLANDO TAREAS ---')

const promises = [
  queue.runTask(createTask('A', 1000)),
  queue.runTask(createTask('B', 3000)),
  queue.runTask(createTask('C', 1000, true)),
  queue.runTask(createTask('D', 1000)),
  queue.runTask(createTask('E', 500))
]

// Monitoreamos el estado de las promesas individuales
promises.forEach((p, index) => {
  p.catch((err) => console.log(`🚨 [ERROR ATRAPADO FUERA] ${err.message}`))
})

// Esperamos a que la cola entera termine
Promise.allSettled(promises).then((results) => {
  console.log('\n--- RESUMEN FINAL ---')
  results.forEach((r) => {
    if (r.status === 'fulfilled') console.log(`🟢 ${r.value}`)
    else console.log(`🔴 Rechazada: ${r.reason.message}`)
  })
  process.exit(0)
})
