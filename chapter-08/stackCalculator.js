class StackCalculator {
  constructor() {
    this.stack = []
  }

  putValue(value) {
    this.stack.push(value)
  }

  getValue() {
    return this.stack.pop()
  }

  peekValue() {
    return this.stack[this.stack.length - 1]
  }

  clear() {
    this.stack = []
  }

  divide() {
    const divisor = this.getValue()
    const dividend = this.getValue()
    const result = dividend / divisor
    this.putValue(result)
    return result
  }

  multiply() {
    const multiplicand = this.getValue()
    const multiplier = this.getValue()
    const result = multiplier * multiplicand
    this.putValue(result)
    return result
  }
}

class SafeCalculator {
  constructor(calculator) {
    this.calculator = calculator
  }

  divide() {
    const divisor = this.calculator.peekValue()
    if (divisor === 0) {
      throw new Error('Division by 0')
    }

    return this.calculator.divide()
  }

  putValue(value) {
    return this.calculator.putValue(value)
  }

  getValue() {
    return this.calculator.getValue()
  }

  peekValue() {
    return this.calculator.peekValue()
  }

  clear() {
    return this.calculator.clear()
  }

  multiply() {
    return this.calculator.multiply()
  }
}

const calculator = new StackCalculator()
const safeCalculator = new SafeCalculator(calculator)

calculator.putValue(3)
calculator.putValue(2)
console.log(calculator.multiply()) // 6
safeCalculator.putValue(2)
console.log(safeCalculator.multiply()) //12
calculator.putValue(0)
console.log(calculator.divide()) // Infinity
safeCalculator.clear()
safeCalculator.putValue(4)
safeCalculator.putValue(0)
// console.log(safeCalculator.divide())

function patchToSafeCalculator(calculator) {
  const divideOrg = calculator.divide

  calculator.divide = () => {
    const divisor = calculator.peekValue()
    if (divisor === 0) {
      throw new Error('Division by 0')
    }

    return divideOrg.apply(calculator)
  }

  return calculator
}

console.log('Using monky patch')
const calculator2 = new StackCalculator()
const mkCalculator = patchToSafeCalculator(calculator2)
mkCalculator.putValue(1)
mkCalculator.putValue(0)
// console.log(mkCalculator.divide())

console.log('Using a proxy object')
const safeCalculatorHandler = {
  get: (target, property) => {
    if (property === 'divide') {
      return () => {
        const divisor = target.peekValue()
        if (divisor === 0) {
          throw new Error('Division by 0')
        }

        return target.divide()
      }
    }

    return target[property]
  }
}

const calculator3 = new StackCalculator()
const safeProxyCalculator = new Proxy(calculator3, safeCalculatorHandler)
safeProxyCalculator.putValue(2)
safeProxyCalculator.putValue(2)
console.log('proxy multiply: ', safeProxyCalculator.multiply())
safeProxyCalculator.putValue(0)
console.log('proxy divide: ', safeProxyCalculator.divide())
