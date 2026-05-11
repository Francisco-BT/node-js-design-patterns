export class Matrix {
  constructor(inMatrix) {
    this.data = inMatrix
  }

  get(row, column) {
    if (row >= this.data.length || column >= this.data[row].length) {
      throw new RangeError('Out of bounds')
    }

    return this.data[row][column]
  }

  set(row, column, value) {
    if (row >= this.data.length || column >= this.data[row].length) {
      throw new RangeError('Out of bounds')
    }

    this.data[row][column] = value
  }

  *[Symbol.iterator]() {
    yield* this.data.flat()
  }
}

const matrix2x2 = new Matrix([
  ['11', '12'],
  ['21', '22']
])
const iterator = matrix2x2[Symbol.iterator]()
let iterationResult = iterator.next()

while (!iterationResult.done) {
  console.log(iterationResult.value)
  iterationResult = iterator.next()
}

for (const element of matrix2x2) {
  console.log(`Element is ${element}`)
}

const flattenedMatrix = [...matrix2x2]
console.log('flattenedMatrix: ', flattenedMatrix)
