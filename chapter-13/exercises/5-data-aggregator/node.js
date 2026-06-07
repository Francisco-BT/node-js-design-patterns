import zmq from 'zeromq'

async function main() {
  // Le pasamos un nombre por la terminal, ej: node node.js Alpha
  const nodeId = process.argv[2] || `Node-${Math.floor(Math.random() * 1000)}`

  // 1. Antena para escuchar las peticiones del Agregador
  const subSocket = new zmq.Subscriber()
  await subSocket.connect('tcp://localhost:5020')
  subSocket.subscribe('')

  // 2. Tubo neumático para enviar la respuesta de vuelta
  const pushSocket = new zmq.Push()
  await pushSocket.connect('tcp://localhost:5021')

  const syncSocket = new zmq.Request()
  await syncSocket.connect('tcp://localhost:5022')

  await syncSocket.send('READY')
  await syncSocket.receive()

  console.log(`[${nodeId}] En línea. Escuchando peticiones...`)

  for await (const [msg] of subSocket) {
    const request = JSON.parse(msg.toString())
    console.log(`[${nodeId}] Solicitud recibida: ${request.action}`)

    // Simulamos la extracción de datos locales del servidor
    const localData = {
      servidor: nodeId,
      estado: 'Saludable',
      ramLibre: `${Math.floor(Math.random() * 8000 + 1000)} MB`
    }

    // Enviamos la respuesta devolviendo el mismo reqId
    await pushSocket.send(
      JSON.stringify({
        reqId: request.reqId,
        data: localData
      })
    )
  }
}

main().catch((err) => console.error(err))
