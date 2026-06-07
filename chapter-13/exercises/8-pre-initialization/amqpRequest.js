import { nanoid } from 'nanoid'
import amqp from 'amqplib'

export class AmqpRequest {
  constructor() {
    this.correlationMap = new Map()
    this.isInitialized = false
    this.preInitQueue = []
    this.initialize()
  }

  async initialize() {
    try {
      this.connection = await amqp.connect('amqp://localhost')
      this.channel = await this.connection.createChannel()
      const { queue } = await this.channel.assertQueue('', { exclusive: true })

      this.replyQueue = queue
      this.channel.consume(
        this.replyQueue,
        (msg) => {
          const correlationId = msg.properties.correlationId
          const handler = this.correlationMap.get(correlationId)

          if (handler) {
            handler(JSON.parse(msg.content.toString()))
          }
        },
        { noAck: true }
      )

      this.isInitialized = true
      for (const sendOperation of this.preInitQueue) {
        sendOperation()
      }

      this.preInitQueue = []
    } catch (err) {
      console.error('Failed to connect to RabbitMQ: ', err)
    }
  }

  send(queue, message) {
    return new Promise((resolve, reject) => {
      const id = nanoid()

      const replyTimeout = setTimeout(() => {
        this.correlationMap.delete(id)
        reject(new Error('Timeout error'))
      }, 10000)

      this.correlationMap.set(id, (replyData) => {
        this.correlationMap.delete(id)
        clearTimeout(replyTimeout)
        resolve(replyData)
      })

      const doSend = () => {
        this.channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)), {
          correlationId: id,
          replyTo: this.replyQueue
        })
      }

      if (this.isInitialized) {
        doSend()
      } else {
        this.preInitQueue.push(doSend)
      }
    })
  }

  destroy() {
    if (this.channel) {
      this.channel.close()
    }
    if (this.connection) {
      this.connection.close()
    }
  }
}
