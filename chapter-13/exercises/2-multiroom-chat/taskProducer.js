import Redis from 'ioredis'

const redis = new Redis()
let taskId = 1

console.log('🌪️ Ventilador P2P iniciado. Inyectando tareas a la tubería...')

setInterval(async () => {
  const tarea = `Procesar video_alta_resolucion_${taskId}.mp4`
  try {
    const id = await redis.xadd('tasks_stream', '*', 'tarea', tarea)
    console.log(`[Producer] -> Tarea encolada. ID: ${id}`)
    taskId++
  } catch (err) {
    console.error('Error enviando tarea:', err)
  }
}, 1000) // 1 tarea por segundo
