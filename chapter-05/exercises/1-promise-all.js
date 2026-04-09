/*
 * 5.1 Dissecting Promise.all(): Implement your own version of Promise.all()
 * leveraging promises, async/await, or a combination of the two. The function
 * must be functionally equivalent to its original counterpart.
 * */

async function promiseAll(promises) {
  const results = []
  let done = 0

  return new Promise((resolve, reject) => {
    if (Array.isArray(promises) && promises.length === 0) {
      return resolve([])
    }

    for (let i = 0; i < promises.length; i++) {
      Promise.resolve(promises[i])
        .then((v) => {
          results[i] = v
          done++

          if (done === promises.length) {
            return resolve(results)
          }
        })
        .catch((err) => reject(err))
    }
  })
}

const promises = [
  10, 2, 3, 5, 10,
  // new Error('upps'),
  4
].map(
  (v) =>
    new Promise((resolve, reject) => {
      setTimeout(() => {
        if (v instanceof Error) {
          reject(v)
        } else {
          resolve(`Value is: ${v}`)
        }
      }, 1000 * v)
    })
)

console.log('custom: ', await promiseAll([]))
console.log('custom: ', await promiseAll([...promises, 'holi']))
console.log('original: ', await Promise.all([...promises, 'holi']))
