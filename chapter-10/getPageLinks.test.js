import { suite, test } from 'node:test'
import assert from 'node:assert/strict'

import { getInternalLinks } from './getPageLinks.js'

suite('getPageLinks', { concurrency: true, timeout: 500 }, () => {
  test('It fetches all the internal links from a page', async (t) => {
    const mockHtml = `
    <html>
      <body>
        <a href="https://loige.co/blog">Blog</a>
        <a href="/speaking">Speaking</a>
        <a href="/about">About</a>
        <a href="https://www.linkedin.com/in/lucianomammino/">My LinkedIn
          profile</a>
        <a href="/about">About</a>
      </body>
    </html>
    `
    t.mock.method(global, 'fetch', async (_url) => ({
      ok: true,
      status: 200,
      headers: {
        get: (key) =>
          key === 'content-type' ? 'text/html; charset=utf-8' : null
      },
      text: async () => mockHtml
    }))

    const links = await getInternalLinks('https://loige.co')

    assert.deepEqual(
      links,
      new Set([
        'https://loige.co/blog',
        'https://loige.co/speaking',
        'https://loige.co/about'
      ])
    )
  })
})
