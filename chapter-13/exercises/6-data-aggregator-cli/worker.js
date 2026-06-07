import zmq from 'zeromq'

import { processTask } from './processTask.js'

async function main() {
  const nodeId = process.pid

  const ventilator = new zmq.Pull()
  await ventilator.connect('tcp://localhost:5016')

  const sink = new zmq.Push()
  await sink.connect('tcp://localhost:5018')

  const killSwitch = new zmq.Subscriber()
  await killSwitch.connect('tcp://localhost:5017')
  killSwitch.subscribe('')

  const ackSender = new zmq.Push()
  await ackSender.connect('tcp://localhost:5019')

  const aggSub = new zmq.Subscriber()
  await aggSub.connect('tcp://localhost:5020')
  aggSub.subscribe('')

  const aggPush = new zmq.Push()
  await aggPush.connect('tcp://localhost:5021')

  const aggSync = new zmq.Request()
  await aggSync.connect('tcp://localhost:5022')

  let status = 'IDLE'
  let currentBatch = 'None'
  let stopProcessing = false

  ;(async () => {
    for await (const [msg] of aggSub) {
      const request = JSON.parse(msg.toString())

      if (request.action === 'get_status') {
        const msg = {
          reqId: request.reqId,
          data: {
            Worker: `PID-${nodeId}`,
            Status: status,
            CurrentBatch: currentBatch
          }
        }
        await aggPush.send(JSON.stringify(msg))
      }
    }
  })()

  //
  ;(async () => {
    for await (const [msg] of killSwitch) {
      if (msg.toString() === 'STOP') {
        console.log(`Stop signal received.`)
        status = 'STOPPED'
        stopProcessing = true
      }
    }
  })()

  await aggSync.send('READY')
  await aggSync.receive()

  for await (const [msg] of ventilator) {
    if (stopProcessing) {
      console.log('Password was found already, skipping process work')
      break
    }

    const task = JSON.parse(msg.toString())

    status = 'WORKING'
    currentBatch = `${task.batchStart}..${task.batchEnd}`
    const result = await processTask(task, () => stopProcessing)

    if (result) {
      status = 'FOUND'
      console.log(`Password found ${result.toString()}`)
      await sink.send(result)
    } else {
      status = 'IDLE'
      currentBatch = 'None'
    }

    await ackSender.send(task.id)
  }
}

main().catch((err) => console.error(err))
