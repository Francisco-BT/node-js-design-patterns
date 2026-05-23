/*
 * 11.1 Proxy with pre-initialization queues: Using a JavaScript Proxy, create
 * a wrapper for adding pre-initialization queues to any object. You should
 * allow the consumer of the wrapper to decide which methods to augment and
 * the name of the property/event that indicates if the component is initialized.
 * */

function createPreInitQueue(proxyTarget, methodsToAugment, isInitializedProp) {
  const queue = []

  return new Proxy(proxyTarget, {
    get(target, prop) {
      if (methodsToAugment.includes(prop) && !proxyTarget[isInitializedProp]) {
        return (...args) =>
          new Promise((resolve, reject) => {
            const action = target[prop]

            queue.push({
              resolve,
              reject,
              method:
                typeof action === 'function'
                  ? () => action.call(proxyTarget, ...args)
                  : action
            })
          })
      }

      return Reflect.get(proxyTarget, prop)
    },
    set(target, prop, value) {
      console.log('setting in proxy: ', target, prop, value)
      target[prop] = value
      if (prop === isInitializedProp && value) {
        while (queue.length > 0) {
          const { method, resolve, reject } = queue.shift()
          try {
            resolve(method())
          } catch (err) {
            reject(err)
          }
        }
      }

      return true
    }
  })
}

// === Asume que aquí arriba está tu función createPreInitQueue ===

// 1. EL OBJETO VULNERABLE
// Finge ser una base de datos que tarda en conectarse
const db = {
  isReady: false,
  query(sql) {
    if (!this.isReady) {
      throw new Error(
        `💥 ¡Explotó! Intentaste ejecutar "${sql}" sin estar conectado.`
      )
    }
    return `✅ Ejecutado con éxito: ${sql}`
  }
}

// 2. ENVOLVEMOS EL OBJETO CON TU PROXY
const safeDb = createPreInitQueue(db, ['query'], 'isReady')

// 3. EL SCRIPT DE PRUEBA
;(async () => {
  console.log('⏳ 1. Lanzando consultas ANTES de que esté listo...')

  // OJO: No usamos 'await' aquí porque queremos que se queden encoladas en el fondo,
  // si pusiéramos await y tu proxy no funciona, el programa explotaría aquí mismo.
  const promesa1 = safeDb.query('SELECT * FROM users')
  const promesa2 = safeDb.query('SELECT * FROM orders')

  console.log(
    '💤 2. Consultas encoladas. Simulando que el sistema tarda 2 segundos en arrancar...'
  )
  await new Promise((resolve) => setTimeout(resolve, 2000))

  console.log('🔌 3. ¡Activando el componente (isReady = true)!')
  // 💥 ¡AQUÍ ES DONDE TU TRAMPA 'set' DEBE HACER SU MAGIA Y VACIAR LA COLA!
  safeDb.isReady = true

  // Ahora sí esperamos a que las promesas que guardamos se resuelvan
  const resultado1 = await promesa1
  const resultado2 = await promesa2

  console.log('\n🎉 4. Resultados de las consultas encoladas:')
  console.log(resultado1)
  console.log(resultado2)

  console.log(
    '\n⚡ 5. Prueba de fuego: Lanzando consulta cuando YA está listo...'
  )
  // Como isReady ya es true, tu trampa 'get' debe dejar pasar esto directamente
  const resultado3 = await safeDb.query('SELECT * FROM config')
  console.log(resultado3)
})()
