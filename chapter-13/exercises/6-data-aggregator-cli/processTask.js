import { createHash } from 'node:crypto'

import isv from 'indexed-string-variation'

export function processTask(task, isStopped) {
  const strings = isv({
    alphabet: task.alphabet,
    from: BigInt(task.batchStart),
    to: BigInt(task.batchEnd)
  })

  let first
  let last

  for (const string of strings) {
    if (isStopped()) {
      return
    }

    if (!first) {
      first = string
    }

    const digest = createHash('sha1').update(string).digest('hex')

    if (digest === task.searchHash) {
      console.log(`Found:${string} => ${digest}`)
      return string
    }

    last = string
  }

  console.log(
    `Processed ${first}..${last} (${task.batchStart}..${task.batchEnd})`
  )
}
