export class LazyPromise extends Promise {
  #resolve
  #reject
  #executor
  #promise

  constructor(executor) {
    let _resolve
    let _reject
    super((resolve, reject) => {
      _resolve = resolve
      _reject = reject
    })

    this.#resolve = _resolve
    this.#reject = _reject
    this.#executor = executor
    this.#promise = null
  }

  #ensureInit() {
    if (!this.#promise) {
      this.#promise = new Promise(this.#executor)
      this.#promise.then(v => this.#resolve(v), e => this.#reject(e))
    }
  }

  then(onFullfild, onReject) {
    this.#ensureInit()
    return this.#promise.then(onFullfild, onReject)
  }

  catch(onRejected) {
    this.#ensureInit()
    return this.#promise.catch(onRejected)
  }

  finally(onFinally) {
    this.#ensureInit()
    return this.#promise.finally(onFinally)
  }
}

const lazyPromise = new LazyPromise(resolve => {
  console.log('Executor started!')
  setTimeout(() => { resolve('Completed') }, 1000)
})

console.log('lazy log instance created')
console.log(lazyPromise)
lazyPromise.then(value => {
  console.log('value: ', value)
  console.log('lazyPromise: ', lazyPromise)

})
