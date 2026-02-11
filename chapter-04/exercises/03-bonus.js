import { readdir, readFile, stat } from 'node:fs'
import { join } from 'node:path'

// ---------------------------------------------------------
// 1. La Herramienta: TaskQueue (El Portero)
// ---------------------------------------------------------
class TaskQueue {
  constructor(concurrency) {
    this.concurrency = concurrency
    this.running = 0
    this.queue = []
  }

  pushTask(task) {
    this.queue.push(task)
    this.next()
  }

  next() {
    // Si ya hay muchos trabajando o no hay nadie en la fila, no hacemos nada
    while (this.running < this.concurrency && this.queue.length) {
      const task = this.queue.shift()

      // Wrapper para saber cuándo termina la tarea y lanzar la siguiente
      task(() => {
        this.running--
        this.next()
      })
      this.running++
    }
  }
}

// ---------------------------------------------------------
// 2. La Lógica: recursiveFind con Control de Concurrencia
// ---------------------------------------------------------
function recursiveFind(dir, keyword, cb) {
  // Configuración: Máximo 2 operaciones simultáneas (Bonus Points!)
  const queue = new TaskQueue(2)

  const matchedFiles = []
  let pending = 0
  let completed = false // Protección extra

  // Helper para proteger el callback (Versión simple de 'once')
  const finish = (err, result) => {
    if (completed) return
    completed = true
    cb(err, result)
  }

  const decreasePending = () => {
    pending--
    if (pending === 0) {
      finish(null, matchedFiles)
    }
  }

  const search = (currentPath) => {
    pending++

    // ENCOLAMOS la operación readdir
    queue.pushTask((done) => {
      readdir(currentPath, (err, files) => {
        if (err) {
          finish(err) // Error fatal
          done() // Liberamos el slot de la cola
          return
        }

        if (files.length === 0) {
          decreasePending()
          done()
          return
        }

        files.forEach((file) => {
          const fullPath = join(currentPath, file)
          pending++

          // ENCOLAMOS la operación stat
          // Nota: Podríamos no encolar stat si queremos ser más rápidos,
          // pero para control total, lo metemos al control de concurrencia.
          queue.pushTask((doneStat) => {
            stat(fullPath, (err, stats) => {
              if (err) {
                finish(err)
                return doneStat()
              }

              if (stats.isDirectory()) {
                search(fullPath) // Recursión (añade sus propias tareas a la cola)
              } else {
                pending++

                // ENCOLAMOS la operación readFile (La más importante de limitar)
                queue.pushTask((doneRead) => {
                  readFile(fullPath, 'utf8', (err, content) => {
                    if (err) {
                      finish(err)
                      return doneRead()
                    }

                    if (content.includes(keyword)) {
                      matchedFiles.push(fullPath)
                    }

                    decreasePending() // Fin de la cadena del archivo
                    doneRead() // Liberamos slot de readFile
                  })
                })
              }

              decreasePending() // Fin del stat
              doneStat() // Liberamos slot de stat
            })
          })
        })

        decreasePending() // Fin del readdir
        done() // Liberamos slot de readdir
      })
    })
  }

  search(dir)
}

// --- TEST ---
console.time('Búsqueda')
recursiveFind(
  '/Users/fbernabe/Projects/mine/node-js-desing-patterns/', // Pon una carpeta real con archivos
  'batman',
  (err, files) => {
    console.timeEnd('Búsqueda')
    if (err) return console.error('Error:', err)
    console.log(`Encontrados: ${files.length}`)
  }
)
