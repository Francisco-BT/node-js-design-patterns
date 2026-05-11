function* twoWayGenerator() {
  const who = yield null
  yield `Hello ${who}`
}

const twoWay = twoWayGenerator()
twoWay.next()
console.log(twoWay.next('World'))

function* extraCapabilities() {
  try {
    const who = yield null

    yield `Hello ${who}`
  } catch (err) {
    yield `Hello error: ${err.message}`
  }
}

console.log('Using throw()')
const twoWayException = extraCapabilities()
twoWayException.next()
console.log(twoWayException.throw(new Error('Boom!')))

console.log('Using return()')
const twoWayReturn = extraCapabilities()
console.log(twoWayReturn.return('myReturnValue'))
