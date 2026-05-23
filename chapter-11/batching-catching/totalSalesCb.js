import { Level } from 'level'

const db = new Level('sales', { valueEncoding: 'json' })

const CACHE_TTL = 30 * 1000 // 30 seconds TTL
const cache = new Map()

function totalSalesRaw(product, cb) {
  console.log('running totalSalesRaw cb version')
  const now = Date.now()
  let sum = 0
}

export function totalSales(product, cb) {
  if (cache.has(product)) {
    console.log('Cache hit')

    return process.nextTick(() => cache.get(product))
  }

  const resultPromise = totalSalesRaw(product)
  cache.set(product, resultPromise)

  resultPromise.then(
    () => {
      setTimeout(() => {
        cache.delete(product)
      }, CACHE_TTL)
    },
    (err) => {
      cache.delete(product)
      throw err
    }
  )

  return resultPromise
}

totalSalesRaw('book', (value) => {
  console.log('value is: ', value)
})
