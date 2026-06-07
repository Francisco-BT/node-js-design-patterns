import Redis from 'ioredis'

const redisClient = new Redis()

const workerId = `worker_${process.pid}`

await redisClient
  .xgroup('CREATE', 'tasks_stream', 'workers_group', '0', 'MKSTREAM')
  .catch((err) => {
    console.error('Consumer group already exist', err)
  })

async function readGroup() {
  while (true) {
    const [[, records]] = await redisClient.xreadgroup(
      'GROUP',
      'workers_group',
      workerId,
      'BLOCK',
      0,
      'COUNT',
      '1',
      'STREAMS',
      'tasks_stream',
      '>'
    )

    for (const [recordId, [, rawTask]] of records) {
      console.log(`Processing record(${recordId}) with data: ${rawTask}`)
      await redisClient.xack('tasks_stream', 'workers_group', recordId)
    }
  }
}

readGroup().catch((err) => console.error('Error running worker: ', err))
