import { DataAggregator } from './index.js'

async function main() {
  const aggregator = new DataAggregator()
  await aggregator.initialize()
  await new Promise((resolve) => setTimeout(resolve, 500))

  console.log('Waiting for nodes to be ready')
  await aggregator.waitForNodes(3)

  console.log('Agregador central iniciado. Solicitando métricas a la red...\n')

  setInterval(async () => {
    // Supongamos que levantamos 3 terminales con node.js, así que esperamos 3 respuestas
    const resultados = await aggregator.sendRequest('get_system_metrics', 3)

    console.log('📦 Reporte Consolidado de la Flota:')
    console.table(resultados)
  }, 5000)
}

main().catch((err) => console.error(err))
