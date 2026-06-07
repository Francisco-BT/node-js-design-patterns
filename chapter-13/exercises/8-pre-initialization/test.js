import { AmqpReply } from './amqpReply.js'
import { AmqpRequest } from './amqpRequest.js'

async function main() {
  const QUEUE_NAME = 'test_pre_init_queue'

  // 1. INSTANCIAMOS (La conexión TCP a RabbitMQ empieza en background)
  const replyServer = new AmqpReply(QUEUE_NAME)
  const requestClient = new AmqpRequest()

  console.log(
    '⚡ Clases instanciadas. Registrando manejador y enviando mensaje INMEDIATAMENTE...'
  )

  // 2. CONFIGURAMOS EL SERVIDOR (RabbitMQ aún no está listo, se guarda en RAM)
  replyServer.handleRequest((req) => {
    console.log(`\n✅ [Servidor] Recibí la tarea: procesando "${req.texto}"`)
    return { resultado: req.texto.toUpperCase(), estado: 'Completado' }
  })

  // 3. DISPARAMOS EL CLIENTE (RabbitMQ aún no está listo, el envío se guarda en RAM)
  try {
    const respuesta = await requestClient.send(QUEUE_NAME, {
      texto: 'magia asíncrona'
    })
    console.log(`🎯 [Cliente] Respuesta final obtenida:`, respuesta)
  } catch (err) {
    console.error('❌ Error:', err)
  }

  // Le damos 2 segundos al sistema para imprimir y luego apagamos todo
  setTimeout(() => {
    console.log('\n🧹 Limpiando conexiones...')
    requestClient.destroy()
    // Nota: El servidor no tiene método destroy en tu código base,
    // pero process.exit forzará el cierre de su canal.
    process.exit(0)
  }, 2000)
}

main()
