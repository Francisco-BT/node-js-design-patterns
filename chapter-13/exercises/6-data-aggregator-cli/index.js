/*
 * 13.5 Data aggregator: Create an abstraction that can be used to send a
 * request to all the nodes connected to the system, and then returns an
 * aggregation of all the replies received by those nodes. Hint: You can use
 * publish/reply to send the request, and any one-way channel to send back the
 * replies. Use any combination of the technologies you have learned.
 * */

import { randomUUID } from 'node:crypto'

import zmq from 'zeromq'

export class DataAggregator {
  constructor() {
    this.pubSocket = new zmq.Publisher()
    this.pullSocket = new zmq.Pull()
    this.syncSocket = new zmq.Reply()
    this.pendingRequests = new Map()
  }

  // Abre los puertos de comunicación
  async initialize() {
    await this.pubSocket.bind('tcp://*:5020')
    await this.pullSocket.bind('tcp://*:5021')
    await this.syncSocket.bind('tcp://*:5022')
    this._listenForReplies() // Encendemos la escucha en background
  }

  async waitForNodes(expectedNodes) {
    console.log('Waiting for nodes to be ready...')
    let nodesReady = 0

    for await (const [msg] of this.syncSocket) {
      console.log('getting message ', msg.toString())
      if (msg.toString() === 'READY') {
        nodesReady++

        await this.syncSocket.send('OK')

        if (nodesReady === expectedNodes) {
          console.log('All expected nodes are ready')
          break
        }
      }
    }
  }

  // El embudo que recolecta las cartas de vuelta
  async _listenForReplies() {
    for await (const [msg] of this.pullSocket) {
      const reply = JSON.parse(msg.toString())

      if (this.pendingRequests.has(reply.reqId)) {
        const req = this.pendingRequests.get(reply.reqId)
        req.replies.push(reply.data)

        // Si ya recibimos la cantidad de respuestas que esperábamos, cerramos el caso
        if (req.replies.length === req.expectedReplies) {
          req.resolve(req.replies)
          this.pendingRequests.delete(reply.reqId)
          clearTimeout(req.timeout)
        }
      }
    }
  }

  // El método público que usaremos en nuestra aplicación
  sendRequest(action, expectedReplies, timeoutMs = 3000) {
    return new Promise((resolve, reject) => {
      const reqId = randomUUID()

      // Si un nodo muere y no responde, no queremos quedarnos congelados para siempre.
      // El timeout resuelve la promesa con lo que sea que hayamos recolectado.
      const timeout = setTimeout(() => {
        if (this.pendingRequests.has(reqId)) {
          const req = this.pendingRequests.get(reqId)
          this.pendingRequests.delete(reqId)
          resolve(req.replies) // Devolvemos resultados parciales
        }
      }, timeoutMs)

      this.pendingRequests.set(reqId, {
        resolve,
        expectedReplies,
        replies: [],
        timeout
      })

      // Gritamos la solicitud por el megáfono
      this.pubSocket.send(JSON.stringify({ reqId, action })).catch((err) => {
        // Si el megáfono explota, limpiamos la basura y rechazamos el error
        clearTimeout(timeout)
        this.pendingRequests.delete(reqId)
        reject(new Error(`Fallo crítico al enviar por ZeroMQ: ${err.message}`))
      })
    })
  }
}
