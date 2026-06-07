import { fork } from 'node:child_process'
import { join } from 'node:path'
import { once } from 'node:events'

import { createRequestChannel } from './createRequestChannel.js'

const channel = fork(join(import.meta.dirname, 'replier.js'))
const request = createRequestChannel(channel)

try {
  const [message] = await once(channel, 'message')
  console.log('[DEBUG]: running requestor, in try', message)
  console.log(`Child process initialized: ${message}`)

  const p1 = request({ a: 1, b: 2, delay: 500 }).then((res) => {
    console.log(`Reply: 1 + 2 = ${res.sum}`)
  })

  const p2 = request({ a: 6, b: 1, delay: 100 }).then((res) => {
    console.log(`Reply: 6 + 1 = ${res.sum}`)
  })

  await Promise.all([p1, p2])
} catch (err) {
  console.error(`Error in requestor: `, err)
} finally {
  channel.disconnect()
}
