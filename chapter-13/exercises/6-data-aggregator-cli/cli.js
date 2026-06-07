import { DataAggregator } from './index.js'

async function main() {
  const expectedWorkers = parseInt(process.argv[2]) || 2

  const aggregator = new DataAggregator()
  await aggregator.initialize()

  console.log('Waiting for workers to be ready...')
  await aggregator.waitForNodes(expectedWorkers)

  console.log('Getting data in real time...')
  setInterval(async () => {
    let resultados = await aggregator.sendRequest(
      'get_status',
      expectedWorkers,
      2000
    )

    // 1. Limpiamos la consola para que no baje infinitamente
    console.clear()
    console.log(
      `\n[${new Date().toLocaleTimeString()}] Monitoreo de Flota (Scatter-Gather)`
    )

    // 2. Ordenamos los resultados por el nombre del Worker para que las filas no bailen
    if (Array.isArray(resultados) && resultados.length > 0) {
      resultados.sort((a, b) => a.Worker.localeCompare(b.Worker))
    }

    // 3. Imprimimos extrayendo solo la data
    console.table(resultados.map((r) => r))
  }, 1000)
}

main().catch((err) => console.error(err))
