import { createServer } from 'node:http'

// eslint-disable-next-line import/no-unresolved
import { createProxyServer } from 'httpxy'

import { ConsulClient } from './consul'

const routing = [
  {
    path: '/api',
    service: 'api-service',
    index: 0
  },
  {
    path: '/',
    service: 'webapp-service',
    index: 0
  }
]

const consultClient = new ConsulClient()
const proxy = createProxyServer()
const server = createServer(async (req, res) => {
  const route = routing.find((route) => req.url.startsWith(route.path))

  try {
    const services = await consultClient.getAllServices()
    const servers = Object.values(services).filter((service) =>
      service.Tags.includes(route.service)
    )

    if (servers.length > 0) {
      route.index = (route.index + 1) % services.length
      const server = servers[route.index]
      const target = `http://${server.Address}:${server.Port}`
      proxy.web(req, res, { target })
      return
    }
  } catch (err) {
    console.error(err)
  }

  // If servers not found on error occurs
  res.writeHead(502)
  return res.end('Bad gateway')
})

server.listen(8080, () => {
  console.log('Load balancer started on port 8080')
})
