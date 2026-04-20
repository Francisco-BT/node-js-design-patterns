/* process.stdin
  .on('readable', () => {
    let chunck
    console.log('New data available')

    while ((chunck = process.stdin.read()) !== null) {
      console.log(
        `Chunck read (${chunck.length} bytes): "${chunck.toString()}"`
      )
    }
  })
  .on('end', () => console.log('End of stream')) */

// FLOWING MODE
process.stdin
  .on('data', (chunck) => {
    console.log('New data available')
    console.log(`Chunck read (${chunck.length} bytes): "${chunck.toString()}"`)
  })
  .on('end', console.log('End of stream'))
