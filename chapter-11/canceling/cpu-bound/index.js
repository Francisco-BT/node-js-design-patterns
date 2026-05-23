import { createServer } from 'node:http'

import { SubsetSum } from './subsetSumFork.js'

const PORT = 8080
createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost')

  console.log('>>> pathname: ', url.pathname)
  if (url.pathname !== '/subsetSum') {
    res.writeHead(200)
    return res.end("I'm alive\n")
  }

  const data = JSON.parse(url.searchParams.get('data'))
  const sum = JSON.parse(url.searchParams.get('sum'))
  res.writeHead(200)

  const subsetSum = new SubsetSum(sum, data)

  subsetSum.on('match', (match) => {
    res.cork()
    res.write(`Match: ${JSON.stringify(match)}\n`)
    res.uncork()
  })

  subsetSum.on('end', () => res.end())
  subsetSum.start()
}).listen(PORT, () => {
  console.log(`Server started and running on port ${PORT}`)
})
