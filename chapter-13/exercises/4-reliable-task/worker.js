import zmq from 'zeromq'

import { processTask } from './processTask.js'

async function main() {
  const ventilator = new zmq.Pull()
  await ventilator.connect('tcp://localhost:5016')

  const sink = new zmq.Push()
  await sink.connect('tcp://localhost:5018')

  const killSwitch = new zmq.Subscriber()
  await killSwitch.connect('tcp://localhost:5017')
  killSwitch.subscribe('')

  const ackSender = new zmq.Push()
  await ackSender.connect('tcp://localhost:5019')

  let stopProcessing = false

  ;(async () => {
    for await (const [msg] of killSwitch) {
      if (msg.toString() === 'STOP') {
        console.log(`Stop signal received.`)
        stopProcessing = true
      }
    }
  })()

  for await (const [msg] of ventilator) {
    if (stopProcessing) {
      console.log('Password was found already, skipping process work')
      break
    }

    const task = JSON.parse(msg.toString())

    const result = await processTask(task, () => stopProcessing)

    if (result) {
      console.log(`Password found ${result.toString()}`)
      await sink.send(result)
    }

    await ackSender.send(task.id)
  }
}

main().catch((err) => console.error(err))
