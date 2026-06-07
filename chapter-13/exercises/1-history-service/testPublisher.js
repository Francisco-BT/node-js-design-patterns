import Redis from 'ioredis'

const redis = new Redis()
let contador = 1

console.log('🤖 Simulador de Chat iniciado. Enviando mensajes...')

setInterval(async () => {
  const mensaje = `Hola, este es el mensaje de prueba #${contador}`
  try {
    // XADD stream_name * key value
    const id = await redis.xadd('chat_stream', '*', 'message', mensaje)
    console.log(`[Publisher] -> Mensaje enviado. ID Redis: ${id}`)
    contador++
  } catch (err) {
    console.error('Error enviando mensaje:', err)
  }
}, 3000)
