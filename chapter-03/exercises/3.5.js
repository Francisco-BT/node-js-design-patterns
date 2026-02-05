/**
 * 3.5 Disk bloat finder: Create a function that accepts the path to a folder on
 * the local file system and identifies the largest file within that folder.
 * For extra credit, enhance the function to search recursively through subfolders.
 * Hint: you can use the node:fs module for this task, specifically the stats() function to
 * determine if a path is a directory or file and to get the file size in bytes, and the readdir()
 * function to list the contents of a directory.
 */
import { stat, readdir } from 'node:fs'
import { join } from 'node:path'

function findLargestFile(dirPath, cb) {
  let largestFile = null
  let running = 0 // Contador global de operaciones pendientes
  let errored = false // 2. Protección contra doble callback

  // Función interna recursiva
  const scan = (currentPath) => {
    if (errored) return // Si ya falló algo, paramos todo

    running++ // Entramos a una operación asíncrona (readdir)

    readdir(currentPath, (err, files) => {
      // 3. Manejo de error temprano
      if (err) {
        errored = true
        return cb(err)
      }

      running-- // Terminó readdir

      // Procesamos cada archivo/carpeta encontrado
      files.forEach((file) => {
        if (errored) return

        const fullPath = join(currentPath, file)
        running++ // Nueva operación asíncrona (stat)

        stat(fullPath, (err, stats) => {
          if (errored) return // Si otro falló mientras hacíamos stat, abortamos

          if (err) {
            errored = true
            return cb(err)
          }

          running-- // Terminó stat

          if (stats.isDirectory()) {
            scan(fullPath) // Recursión
          } else if (stats.isFile()) {
            if (!largestFile || stats.size > largestFile.size) {
              largestFile = { path: fullPath, size: stats.size }
            }
          }

          // 4. Check final: ¿Soy la última operación viva en todo el árbol?
          if (running === 0) {
            cb(null, largestFile)
          }
        })
      })

      // Caso especial: Carpeta vacía al final de la recursión
      // Si running llega a 0 aquí, significa que no lanzamos ningún stat nuevo
      if (running === 0) {
        cb(null, largestFile)
      }
    })
  }

  // Iniciamos
  scan(dirPath)
}

findLargestFile(
  '/Users/fbernabe/Projects/mine/node-js-desing-patterns/chapter-03/exercises/',
  (err, file) => {
    if (err) {
      console.error('Error finding largest file:', err)
      return
    }
    console.log('Largest file:', file)
  }
)
