class RangeIterator extends Iterator {
  #start
  #end
  #step
  #current
  constructor(start, end, step = 1) {
    super()
    this.#start = start
    this.#end = end
    this.#step = step
    this.#current = undefined
  }

  next() {
    this.#current =
      this.#current === undefined ? this.#start : this.#current + this.#step

    if (
      this.#step > 0 ? this.#current < this.#end : this.#current > this.#end
    ) {
      return { done: false, value: this.#current }
    }

    return { done: true }
  }
}

for (const item of new RangeIterator(1, -6, -1)) {
  console.log(item)
}

const zeroToTen = new RangeIterator(0, 10)
const doubledEven = zeroToTen
  .filter((n) => n % 2 === 0)
  .map((n) => n * 2)
  .toArray()
console.log('doubleEven: ', doubledEven)
