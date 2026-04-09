function delay(ms) {
  return new Promise(resolve => {
    setTimeout(() => { resolve(Date.now()) }, ms)
  })
}

function leakingLoop() {
  return delay(1).then(() => {
    console.log(`Tick ${Date.now()}`)
    return leakingLoop()
  })
}

function nonLeakingLoop() {
  return delay(1).then(() => {
    console.log(`Tick: ${Date.now()}`)

    nonLeakingLoop()
  })
}

for (let i = 0; i < 1e6; i++) {
  nonLeakingLoop()
}

