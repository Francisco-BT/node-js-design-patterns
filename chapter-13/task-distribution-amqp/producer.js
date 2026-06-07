import amqp from 'amqplib'

import { generateTasks } from '../task-distribution/generateTask.js'

const ALPHABET = 'abcdefghijklmnopqrstuvwxyz'
const BATCH_SIZE = 10000

const [, , maxLength, searchHash] = process.argv

const connection = await amqp.connect('amqp://localhost')
const channel = await connection.createConfirmChannel()
await channel.assertQueue('task_queue')

const generatorObject = generateTasks(
  searchHash,
  ALPHABET,
  maxLength,
  BATCH_SIZE
)

for (const task of generatorObject) {
  console.log(`Sending task: ${task}`)

  await channel.sendToQueue('task_queue', Buffer.from(task))
}

await channel.waitForConfirms()
channel.close()
connection.close()
