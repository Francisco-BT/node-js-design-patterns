import { parentPort } from 'node:worker_threads'

import { SubsetSum } from '../subsetSum'

parentPort.on('message', (message) => {
  const subsetSum = new SubsetSum(message.sum, message.set)

  subsetSum.on('match', (data) => {
    process.send({ event: 'match', data })
  })

  subsetSum.on('end', (data) => {
    process.send({ event: 'end', data })
  })

  subsetSum.start()
})

process.send('start')
