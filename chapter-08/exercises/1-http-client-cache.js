/*
 * 8.1 HTTP client cache: Write a proxy for your favorite HTTP client library
 * that caches the response of a given HTTP request, so that if you make the
 * same request again, the response is immediately returned from the local cache,
 * rather than being fetched from the remote URL. If you need inspiration,
 * you can check out the superagent-cache module (nodejsdp.link/superagent-cache).
 * */
const apiClient = {
  async get(url) {
    const response = await fetch(url)
    return response.json()
  }
}

const cache = new Map()
const TTL_MILLISECONDS = 3000

const sleep = (ms) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

function isExpired(moment) {
  console.log('isExpired validation: ', {
    now: Date.now(),
    expiresAt: moment,
    TTL: moment + TTL_MILLISECONDS
  })
  return Date.now() > moment + TTL_MILLISECONDS
}

const cachedApiClient = new Proxy(apiClient, {
  get(target, property) {
    if (property === 'get') {
      return async function (url) {
        try {
          const existing = cache.get(url)

          if (existing && !isExpired(existing.expiresAt)) {
            console.log('Found non expired cache data: ')
            return existing.data
          }

          console.log('Fetching new fresh data: ')
          const data = await target[property](url)
          console.log('After get the data')
          cache.set(url, { data, expiresAt: Date.now() })

          return data
        } catch (err) {
          console.error('Error fetching data in the proxy', err)
        }
      }
    }

    return target[property]
  }
})

// Test code
async function run() {
  console.log('--- Primera Petición ---')
  await cachedApiClient.get('https://pokeapi.co/api/v2/pokemon/ditto')

  console.log('\n--- Segunda Petición (Idéntica) ---')
  await cachedApiClient.get('https://pokeapi.co/api/v2/pokemon/ditto')

  console.log('\n--- Esperando 4 segundos para invalidar la cache ---')
  await sleep(4000)
  console.log('\n--- Tercera Petición after 4000 ms (Refetch) ---')
  await cachedApiClient.get('https://pokeapi.co/api/v2/pokemon/ditto')

  console.log('\n--- Cuarta Petición (Nueva URL) ---')
  await cachedApiClient.get('https://pokeapi.co/api/v2/pokemon/pikachu')
}

run()
