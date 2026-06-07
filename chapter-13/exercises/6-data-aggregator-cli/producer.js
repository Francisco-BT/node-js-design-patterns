import zmq from 'zeromq'
import { nanoid } from 'nanoid'

import { generateTasks } from './generateTask.js'

const ALPHABET = 'abcdefghijklmnopqrstuvwxyz'
const BATCH_SIZE = 10000
const TIMEOUT_MS = 2000

const [, , maxLength, searchHash] = process.argv
const ventilator = new zmq.Push()
await ventilator.bind('tcp://*:5016')

const ackReceiver = new zmq.Pull()
await ackReceiver.bind('tcp://*:5019')

const killSwitch = new zmq.Subscriber()
await killSwitch.connect('tcp://localhost:5017')
killSwitch.subscribe('')

const pendingTasks = new Map()

// ;(async () => {
//   for await (const [msg] of killSwitch) {
//     if (msg.toString() === 'STOP') {
//       console.log(`Kill switch activate closing it ${msg}`)
//       process.exit(0)
//     }
//   }
// })()
;(async () => {
  for await (const [msg] of ackReceiver) {
    const ackId = msg.toString()

    if (pendingTasks.has(ackId)) {
      pendingTasks.delete(ackId)
    }
  }
})()

setInterval(async () => {
  const now = Date.now()

  for (const [id, record] of pendingTasks.entries()) {
    if (now - record.timestamp > TIMEOUT_MS) {
      console.warn(`[ALERT]. Task ${id} without response, retrying`)
      record.timestamp = now
      try {
        await ventilator.send(JSON.stringify(record.data))
      } catch (err) {
        if (err?.code === 'EBUSY') {
          console.info(`[WAIT]: socket is bussy`)
        } else {
          throw err
        }
      }
    }
  }

  if (pendingTasks.size === 0) {
    console.log(`No pending tasks to process, shutting down the producer`)
    process.exit(0)
  }
}, 1000)

const generateObject = generateTasks(
  searchHash,
  ALPHABET,
  maxLength,
  BATCH_SIZE
)

for (const rawTask of generateObject) {
  const taskObj = JSON.parse(rawTask)
  const taskData = { id: nanoid(), ...taskObj }
  pendingTasks.set(taskData.id, { data: taskData, timestamp: Date.now() })

  await ventilator.send(JSON.stringify(taskData))
}
