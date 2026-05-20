import { suite, test, mock } from 'node:test'
import assert from 'node:assert/strict'
import { setImmediate } from 'node:timers/promises'

import { fetchWithRetry } from './2-retry.js'

suite('fetchWithRetry', { concurrency: true, timeout: 500 }, (t) => {
  test('Should retry a given times with success', async () => {
    let tries = 0
    const maxRetries = 3
    const asyncFn = mock.fn(async () => {
      tries++
      await setImmediate()
      if (tries < maxRetries) {
        throw new Error('Not ready yet')
      }

      return 'OK!'
    })

    const result = await fetchWithRetry(asyncFn, maxRetries)
    assert.equal(result, 'OK!')
    assert.equal(asyncFn.mock.callCount(), maxRetries)
  })

  test.only('Retries a givent times but throws error', async () => {
    let tries = 0
    const asyncFnFail = mock.fn(async () => {
      throw `Failed times: ${++tries}`
    })

    await assert.rejects(fetchWithRetry(asyncFnFail, 3))
    assert.equal(asyncFnFail.mock.callCount(), 3)
  })
})
