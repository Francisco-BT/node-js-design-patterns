/*
 * Exercise 9.3 Warehouse item: Imagine we are working on a warehouse management
 * program. Our next task is to create a class to model a warehouse item and
 * help track it. Such a WarehouseItem class has a constructor, which accepts
 * an id and the initial state of the item (which can be one of arriving,
 * stored, or delivered). It has three public methods:
 *
 * 1. store(locationId) moves the item into the stored state and records the
 *    locationId where it’s stored.
 * 2. deliver(address) changes the state of the item to delivered, sets the
 *    delivery address, and clears the locationId.
 * 3. describe() returns a string representation of the current state of the
 *    item (for example, “Item 5821 is on its way to the warehouse,” or
 *    “Item 3647 is stored in location 1ZH3,” or “Item 3452 was delivered to John Smith, 1st Avenue, New York”).
 *    The arriving state can be set only when the object is created, as it cannot
 *    be transitioned to from the other states. An item can’t move back to the
 *    arriving state once it’s stored or delivered, it cannot be moved back to
 *    stored once it’s delivered, and it cannot be delivered if it’s not stored
 *    first. Use the State pattern to implement the WarehouseItem class.
 * */

class WarehouseItem {
  #state // One of arriving, stored, delivered
  #states
  constructor(id, initialState = 'arriving') {
    this.id = id
    this.#states = {
      arriving: new ArrivingState(this),
      stored: new StoredState(this),
      delivered: new DeliveredState(this)
    }
    this.changeState(initialState)
  }

  changeState(state) {
    this.#state = this.#states[state]
  }

  store(locationId) {
    this.#state.store(locationId)
  }

  deliver(address) {
    this.#state.deliver(address)
  }

  describe() {
    return this.#state.describe()
  }
}

class ArrivingState {
  constructor(warehouseItem) {
    this.item = warehouseItem
  }

  store(locationId) {
    this.item.locationId = locationId
    this.item.changeState('stored')
  }

  deliver() {
    throw new Error('Cannot deliver an item that is not stored yet')
  }

  describe() {
    return `Item ${this.item.id} is on its way to the warehouse`
  }
}

class StoredState {
  constructor(warehouse) {
    this.item = warehouse
  }

  store() {
    throw new Error('Cannot stored an item that is already stored')
  }

  deliver(address) {
    this.item.locationId = null
    this.item.address = address
    this.item.changeState('delivered')
  }

  describe() {
    return `Item ${this.item.id} is stored in location ${this.item.locationId}`
  }
}

class DeliveredState {
  constructor(warehouse) {
    this.item = warehouse
  }

  store() {
    throw new Error('Cannot stored an item that is already delivered')
  }

  deliver() {
    throw new Error('Cannot deliver an item that is already delivered')
  }

  describe() {
    return `Item ${this.item.id} was delivered to "${this.item.address}"`
  }
}

// === CÓDIGO DE PRUEBA (TDD) ===
// Asume que aquí arriba estarán tus clases:
// WarehouseItem, ArrivingState, StoredState, y DeliveredState

function runWarehouseTests() {
  console.log('--- 🟢 TEST 1: EL CAMINO FELIZ ---')

  // 1. Nace llegando
  const item1 = new WarehouseItem('5821', 'arriving')
  console.log(item1.describe())
  // Salida esperada: "Item 5821 is on its way to the warehouse"

  // 2. Entra al almacén
  item1.store('1ZH3')
  console.log(item1.describe())
  // Salida esperada: "Item 3647 is stored in location 1ZH3"

  // 3. Se entrega al cliente
  item1.deliver('John Smith, 1st Avenue, New York')
  console.log(item1.describe())
  // Salida esperada: "Item 3452 was delivered to John Smith, 1st Avenue, New York"

  console.log('\n--- 🔴 TEST 2: PRUEBA DE FUEGO (Rompiendo las reglas) ---')
  const item2 = new WarehouseItem('9999', 'arriving')

  // Intento ilegal 1: Entregar sin almacenar
  try {
    console.log(
      '⏳ Intentando entregar un paquete que apenas viene en camino...'
    )
    item2.deliver('Fake Address')
    console.log('❌ FALLO: Tu código permitió una entrega ilegal.')
  } catch (err) {
    console.log(`✅ Bloqueo exitoso: ${err.message}`)
  }

  // Almacenamos correctamente para la siguiente prueba
  item2.store('RACK-42')

  // Intento ilegal 2: Almacenar algo ya almacenado
  try {
    console.log(
      '\n⏳ Intentando mover a otro rack usando store() un paquete ya almacenado...'
    )
    item2.store('RACK-99')
    console.log('❌ FALLO: Tu código permitió almacenar de nuevo.')
  } catch (err) {
    console.log(`✅ Bloqueo exitoso: ${err.message}`)
  }

  // Entregamos correctamente para la última prueba
  item2.deliver('Jane Doe, 5th Ave')

  // Intento ilegal 3: Almacenar algo entregado
  try {
    console.log(
      '\n⏳ Intentando devolver al almacén un paquete ya entregado...'
    )
    item2.store('RACK-1')
    console.log(
      '❌ FALLO: Tu código permitió regresar al almacén un paquete entregado.'
    )
  } catch (err) {
    console.log(`✅ Bloqueo exitoso: ${err.message}`)
  }
}

runWarehouseTests()
