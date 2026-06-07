import zmq from 'zeromq'

import { generateTasks } from './generateTask.js'

const ALPHABET = 'abcdefghijklmnopqrstuvwxyz'
const BATCH_SIZE = 10000

const [, , maxLength, searchHash] = process.argv
const ventilator = new zmq.Push()
await ventilator.bind('tcp://*:5016')

const generateObject = generateTasks(
  searchHash,
  ALPHABET,
  maxLength,
  BATCH_SIZE
)

for (const task of generateObject) {
  await ventilator.send(task)
}
