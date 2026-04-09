function delay(ms) {
  return new Promise((resolve,) => {
    setTimeout(() => {
      resolve(Date.now())
    }, ms)
  })
}

async function playingWithDelays() {
  console.log('Delaying...', Date.now())
  const timeAfterOneSecond = await delay(1000)
  console.log(timeAfterOneSecond)
  const timeAfterThreeSeconds = await delay(3000)
  console.log(timeAfterThreeSeconds)

  return 'done'
}

// (async () => {
//   const result = await playingWithDelays()
//   console.log(`After 4 seconds: ${result}`)
// })()


// const result = await playingWithDelays()
// console.log(`After 4 seconds: ${result}`)


function delayError(ms) {
  return new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error(`Error after ${ms}ms`))
    }, ms)
  })
}

async function playingWithErrors(throwSyncError) {
  try {
    if (throwSyncError) {
      throw new Error('This is a synchronous error')
    }
    await delayError(1000)

  } catch (error) {
    console.error(`We have an error ${error.message}`)
  } finally {
    console.log('done')
  }
}

// Show a synchronous error
// playingWithErrors(true)
playingWithErrors(false)
