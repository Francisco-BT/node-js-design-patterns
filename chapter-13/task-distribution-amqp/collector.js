import amqp from 'amqplib'

const connection = await amqp.connect('amqp://localhost')
const channel = await connection.createChannel()
const { queue } = await channel.assertQueue('result_queue')

channel.consume(queue, async (msg) => {
  console.log(`Message from worker: ${msg.content.toString()}`)

  await channel.ack(msg)
})
