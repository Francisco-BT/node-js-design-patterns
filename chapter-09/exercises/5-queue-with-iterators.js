/*
 * Exercise 9.5 Queues with iterators: Implement an AsyncQueue class similar to
 * one of the TaskQueue classes we defined in Chapter 5, Asynchronous Control
 * Flow Patterns with Promises and Async/Await, but with a slightly different
 * behavior and interface. Such an AsyncQueue class will have a method called
 * enqueue() to append new queue to the queue and then expose an @@asyncIterable
 * method, which should provide the ability to process the elements of the
 * queue asynchronously, one at a time (so, with a concurrency of 1). The async
 * iterator returned from AsyncQueue should terminate only after the done()
 * method of AsyncQueue is invoked and only after all queue in the queue are
 * consumed. Consider that the @@asyncIterable method could be invoked in more
 * than one place, thus returning an additional async iterator, which would
 * allow you to increase the concurrency with which the queue is consumed.
 * */

class AsyncQueue {
  constructor() {
    this.queue = []
    this.pendingResolvers = []
  }

  enqueue(item) {
    this.queue.push(item)
    const resolve = this.pendingResolvers.shift()

    if (resolve) {
      resolve()
    }
  }

  done() {
    this.isDone = true

    while (this.pendingResolvers.length > 0) {
      const resolve = this.pendingResolvers.shift()
      resolve()
    }
  }

  async *[Symbol.asyncIterator]() {
    while (true) {
      if (this.queue.length > 0) {
        const item = this.queue.shift()
        yield item
      } else if (this.isDone) {
        return
      } else {
        await new Promise((resolve) => {
          this.pendingResolvers.push(resolve)
        })
      }
    }
  }
}

// === CÓDIGO DE PRUEBA (TDD) ===
// Asume que aquí arriba estará tu clase AsyncQueue

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

async function runQueueTests() {
  console.log('--- 🟢 TEST 1: Consumo Básico Secuencial ---')
  const queue1 = new AsyncQueue()

  queue1.enqueue('Paquete A')
  queue1.enqueue('Paquete B')
  queue1.done()

  // Como los datos ya están, esto debería imprimirse instantáneamente
  for await (const item of queue1) {
    console.log(`📦 Consumidor 1 recibió: ${item}`)
  }
  console.log('✅ Test 1 terminado (Iterador completado).\n')

  console.log('--- ⏳ TEST 2: Consumidor esperando al Productor ---')
  const queue2 = new AsyncQueue()

  // El productor es lento (finge venir de una base de datos o red)
  setTimeout(() => queue2.enqueue('Manzana (Llegó a los 100ms)'), 100)
  setTimeout(() => queue2.enqueue('Pera (Llegó a los 300ms)'), 300)
  setTimeout(() => queue2.done(), 400) // Cierra la puerta a los 400ms

  console.log('Iniciando consumidor (se quedará dormido esperando...)')
  const inicio = Date.now()

  // Este bucle debe pausarse por sí solo
  for await (const item of queue2) {
    const tiempo = Date.now() - inicio
    console.log(`📦 A los ~${tiempo}ms recibió: ${item}`)
  }
  console.log('✅ Test 2 terminado (El iterador supo esperar y despertar).\n')

  console.log('--- 🏃‍♂️ TEST 3: Concurrencia (Varios consumidores) ---')
  const queue3 = new AsyncQueue()

  // Consumidor A (Lento)
  const consumerA = async () => {
    for await (const item of queue3) {
      console.log(`👷‍♂️ Consumidor A procesando: ${item}`)
      await sleep(100) // Tarda mucho en procesar
    }
    console.log('🛑 Consumidor A se retiró.')
  }

  // Consumidor B (Rápido)
  const consumerB = async () => {
    for await (const item of queue3) {
      console.log(`👩‍🔧 Consumidor B procesando: ${item}`)
      await sleep(20) // Es rapidísimo
    }
    console.log('🛑 Consumidor B se retiró.')
  }

  // Lanzamos a ambos a esperar al mismo tiempo
  const concurrencia = Promise.all([consumerA(), consumerB()])

  // Lanzamos 5 tareas a la cola inmediatamente
  for (let i = 1; i <= 5; i++) {
    queue3.enqueue(`Tarea ${i}`)
  }
  // Cerramos la fábrica
  queue3.done()

  // Esperamos a que los dos terminen
  await concurrencia
  console.log(
    '✅ Test 3 terminado (Las tareas se repartieron perfectamente).\n'
  )
}

runQueueTests()
