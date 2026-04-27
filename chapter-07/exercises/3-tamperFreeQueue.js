/*
 * 7.3 A tamper-free queue: Create a Queue class that has only one publicly
 * accessible method called dequeue(). Such a method returns a Promise that
 * resolves with a new element extracted from an internal queue data structure.
 * If the queue is empty, then the Promise will resolve when a new item is added.
 * The Queue class must also have a revealing constructor that provides a function
 * called enqueue() to the executor that pushes a new element to the end of the
 * internal queue. The enqueue() function can be invoked asynchronously, and it
 * must also take care of “unblocking” any eventual Promise returned by the dequeue()
 * method. To try out the Queue class, you could build a small HTTP server into
 * the executor function. Such a server would receive messages or tasks from a client
 * and would push them into the queue. A loop would then consume all those
 * messages using the dequeue() method.*/
import http from 'node:http'

class Queue {
  constructor(executor) {
    const queue = []
    const waitingDequeue = []

    const enqueue = (item) => {
      if (waitingDequeue.length > 0) {
        const resolve = waitingDequeue.shift()
        resolve(item)
      } else {
        queue.push(item)
      }
    }

    executor({ enqueue })

    this.dequeue = () => {
      return new Promise((resolve) => {
        if (queue.length > 0) {
          const item = queue.shift()
          resolve(item)
        } else {
          waitingDequeue.push(resolve)
        }
      })
    }
  }
}

// === SCRIPT DE PRUEBA ===

// 1. Instanciamos nuestra Cola Inviolable
const miColaSegura = new Queue(({ enqueue }) => {
  // El "executor" crea el servidor HTTP y atrapa la función 'enqueue'
  const server = http.createServer((req, res) => {
    // Escuchamos cualquier petición
    const timestamp = new Date().toLocaleTimeString()
    const task = `Tarea recibida a las ${timestamp} desde la ruta: ${req.url}`

    // Inyectamos la tarea a la cola secreta
    enqueue(task)

    res.writeHead(200, { 'Content-Type': 'text/plain' })
    res.end('¡Tarea encolada con éxito!\n')
  })

  server.listen(3000, () => {
    console.log('📡 Servidor HTTP escuchando en el puerto 3000...')
    console.log(
      'Prueba enviar peticiones abriendo otra terminal y ejecutando: curl http://localhost:3000/hola'
    )
  })
})

// 2. El Consumidor (Bucle Infinito)
async function consumeTasks() {
  console.log('👷 Consumidor iniciado. Esperando tareas pacientemente...')

  while (true) {
    // Aquí el código se pausa (await) si la cola está vacía
    const task = await miColaSegura.dequeue()

    console.log(`✅ Procesando: "${task}"`)

    // Si intentas hacer esto, fallará (Protección de manipulaciones)
    // miColaSegura.enqueue('Hack') // TypeError: miColaSegura.enqueue is not a function
  }
}

// Arrancamos el consumidor
consumeTasks()
