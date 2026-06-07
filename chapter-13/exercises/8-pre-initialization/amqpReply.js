import amqp from 'amqplib'

export class AmqpReply {
  constructor(requestQueueName) {
    this.requestQueueName = requestQueueName

    this.isInitialized = false
    this.pendingHandlers = []
    this.initialize()
  }

  async initialize() {
    try {
      this.connection = await amqp.connect('amqp://localhost')
      this.channel = await this.connection.createChannel()
      const { queue } = await this.channel.assertQueue(this.requestQueueName)

      this.queue = queue
      this.isInitialized = true

      for (const handler of this.pendingHandlers) {
        this._setupConsumer(handler)
      }

      this.pendingHandlers = []
    } catch (err) {
      console.log(
        'There is a problem to stablish the connection with RabbitMQ: ',
        err
      )
    }
  }

  handleRequest(handler) {
    if (!this.isInitialized) {
      this.pendingHandlers.push(handler)
      return
    }

    this._setupConsumer(handler)
  }

  _setupConsumer(handler) {
    console.log('>>> Running consumer:, ', handler)
    this.channel.consume(this.queue, async (msg) => {
      console.log('>>> Processing message in replier:', msg)
      const content = JSON.parse(msg.content.toString())
      const replyData = await handler(content)

      this.channel.sendToQueue(
        msg.properties.replyTo,
        Buffer.from(JSON.stringify(replyData)),
        { correlationId: msg.properties.correlationId }
      )
      this.channel.ack(msg)
    })
  }
}
