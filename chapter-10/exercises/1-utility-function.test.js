import { suite, test } from 'node:test'
import assert from 'node:assert/strict'

import { slugify } from './1-utility-function.js'

suite('slugify', { concurrency: true, timeout: 500 }, () => {
  test('Returns the output in lowercase', () => {
    const text = 'Hello'
    const result = slugify(text)

    assert.equal(result, 'hello')
  })

  test('Removes special characters', () => {
    const text = 'hello!'
    const result = slugify(text)

    assert.equal(result, 'hello')
  })

  test('Multiple spaces or dashes are collapsed into a single dash', () => {
    const text = 'Hello  world!---test'
    const result = slugify(text)

    assert.equal(result, 'hello-world-test')
  })
})
