import zmq from 'zeromq'

async function main() {
  const receiver = new zmq.Pull()
  await receiver.bind('tcp://*:5018')

  const broadcaster = new zmq.Publisher()
  await broadcaster.bind('tcp://*:5017')

  console.log('Sink started, waiting for the right password')

  for await (const [msg] of receiver) {
    console.log(`Password found!: ${msg.toString()}`)

    await broadcaster.send('STOP')
    process.exit(0)
  }
}

main().catch((err) => console.error('Sink start failed: ', err))
