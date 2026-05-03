/*
 * 8.5 The lazy buffer: Can you implement createLazyBuffer(size), a factory
 * function that generates a virtual proxy for a Buffer of the given size?
 * The proxy instance should instantiate a Buffer object (effectively
 * allocating the given amount of memory) only when write() is being
 * invoked for the first time. If no attempt to write into the buffer is made,
 * no Buffer instance should be created.
 * */

const createLazyBuffer = (size) => {
  let realBuffer = null

  return new Proxy(
    {},
    {
      get(target, property) {
        if (property === 'length' && realBuffer === null) {
          return size
        }

        if (property === 'write') {
          if (realBuffer === null) {
            console.log(`Allocating ${size} in a buffer`)
            realBuffer = Buffer.alloc(size)
          }
        }

        if (realBuffer === null) {
          return property === 'toString' ? () => '' : () => {}
        }

        const value = realBuffer[property]
        return typeof value === 'function' ? value.bind(realBuffer) : value
      }
    }
  )
}

// Test code
function runTest() {
  console.log('1. 🏗️ Solicitando un buffer de 1024 bytes...')
  const myLazyBuffer = createLazyBuffer(1024)
  console.log(
    '✅ Proxy creado. (Si tu código está bien, NO debió salir el mensaje de asignación aún).'
  )

  console.log('\n2. 📏 Consultando la propiedad length...')
  console.log(`Tamaño reportado: ${myLazyBuffer.length} bytes.`)
  console.log(
    '✅ Longitud consultada. (Aún NO debe haber asignación de memoria).'
  )

  console.log('\n3. ✍️ Ejecutando myLazyBuffer.write()...')
  // ¡AQUÍ ES DONDE DEBE APARECER TU CONSOLE.LOG INTERNO DICIENDO QUE SE ASIGNÓ MEMORIA!
  myLazyBuffer.write('¡Hola desde la memoria diferida!', 'utf8')

  console.log('\n4. 📖 Ejecutando myLazyBuffer.toString()...')
  console.log('Contenido:', myLazyBuffer.toString('utf8'))
}

runTest()
