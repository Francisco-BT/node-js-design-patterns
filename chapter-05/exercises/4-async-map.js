/*
 * 5.4 An asynchronous map(): Implement a concurrent asynchronous version of
 * Array.map() that supports promises and a concurrency limit. The function should
 * not directly leverage the TaskQueue or TaskQueuePC classes we presented in this
 * chapter, but it can use the underlying patterns. The function, which we will
 * define as mapAsync(iterable, callback, concurrency),
 * */

/**
 * @Param {iterable} array
 */
async function mapAsync(iterable, callback, concurrency) {
  const results = []
  let completed = 0
  let currentIndex = 0
  let hasFailed = false // Bandera de seguridad

  return new Promise((resolve, reject) => {
    // 🛡️ Guardia del array vacío
    if (iterable.length === 0) {
      return resolve([])
    }

    async function worker() {
      // Si ya falló otra tarea, o si ya no hay elementos, este trabajador se retira
      let taskIndex = currentIndex++
      if (hasFailed || taskIndex >= iterable.length) {
        return
      }

      const item = iterable[taskIndex]

      try {
        const result = await callback(item)
        results[taskIndex] = result
        completed++

        if (completed === iterable.length) {
          resolve(results)
          return
        }

        worker()
      } catch (err) {
        hasFailed = true // Avisamos a los demás trabajadores que aborten misión
        reject(err) // Rompemos la promesa principal
      }
    }

    // Encendemos el motor con el límite de concurrencia exacto
    for (let i = 0; i < concurrency; i++) {
      worker()
    }
  })
}

// Utilidad para simular tiempo de espera
const delay = (ms) => new Promise((res) => setTimeout(res, ms))

// Nuestro callback "Trabajador"
const procesarItem = async (item) => {
  console.log(
    `⏳ [INICIO] Tarea ${item.nombre} arrancó. (Tardará ${item.tiempo}ms)`
  )

  await delay(item.tiempo)

  if (item.falla) {
    console.log(`💥 [EXPLOSIÓN] La tarea ${item.nombre} falló a propósito!`)
    throw new Error(`Fallo crítico en ${item.nombre}`)
  }

  console.log(`✅ [FIN] Tarea ${item.nombre} terminó.`)
  // Devolvemos el resultado transformado (simulando un Array.map real)
  return `[Resultado de ${item.nombre}]`
}

async function correrPrueba() {
  // Array de prueba (el iterable)
  const tareas = [
    { nombre: 'A', tiempo: 1000 },
    { nombre: 'B', tiempo: 3000 }, // La más lenta
    { nombre: 'C', tiempo: 1000 },
    { nombre: 'D', tiempo: 1000 },
    { nombre: 'E', tiempo: 500 }
  ]

  const limiteConcurrencia = 2

  console.log('🚀 --- INICIANDO PRUEBA MAP_ASYNC ---')
  console.log(
    `Elementos: ${tareas.length} | Límite Concurrencia: ${limiteConcurrencia}\n`
  )

  console.time('TiempoTotal')
  try {
    const resultados = await mapAsync(tareas, procesarItem, limiteConcurrencia)

    console.log('\n🎉 --- PRUEBA EXITOSA ---')
    console.log('Array final devuelto:')
    console.log(resultados)
  } catch (error) {
    console.error('\n🚨 --- ERROR ATRAPADO POR EL CATCH PRINCIPAL ---')
    console.error(error.message)
  }
  console.timeEnd('TiempoTotal')
}

correrPrueba()
