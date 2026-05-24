import { createServer } from 'node:http'
import { once } from 'node:events'
import { cpus } from 'node:os'
import cluster from 'node:cluster'

if (cluster.isPrimary) {
  const availableCpus = cpus()
  console.log(`Clustering to ${availableCpus.length} processes`)
  for (let i = 0; i < availableCpus.length; i++) {
    cluster.fork()
  }

  cluster.on('exit', (worker, code) => {
    if (code !== 0 && !worker.exitedAfterDisconnect) {
      console.log(`Worker ${worker.process.pid} crashed. Starting a new worker`)
      cluster.fork()
    }
  })

  process.on('SIGUSR2', async () => {
    const workers = Object.values(cluster.workers)

    for (const worker of workers) {
      console.log(`Stopping worker: ${worker.process.pid}`)
      worker.disconnect()
      await once(worker, 'exit')
      if (!worker.exitedAfterDisconnect) {
        continue
      }

      const newWorker = cluster.fork()
      await once(newWorker, 'listening')
    }
  })
} else {
  setInterval(
    () => {
      if (Math.random() < 0.5) {
        throw new Error(`Ooops... ${process.pid} crashed!`)
      }
    },
    Math.ceil(Math.random() * 3) * 1000
  )

  const server = createServer((_, res) => {
    let i = 1e7
    while (i > 0) {
      i--
    }

    console.log(`Handling request from ${process.pid}`)
    res.end(`Hello from ${process.pid}\n`)
  })

  server.listen(8080, () => console.log(`Started at ${process.pid}`))
}
