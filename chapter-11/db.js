import { setTimeout } from 'node:timers/promises'

class Database {
  connected = false
  #pendingConnection = null
  commandsQueue = []

  async connect() {
    if (!this.connected) {
      if (this.#pendingConnection) {
        return this.#pendingConnection
      }
      // simulate the delay for the connection
      this.#pendingConnection = setTimeout(500)
      await this.#pendingConnection
      this.connected = true
      this.#pendingConnection = null
      // once connected execute all the queued commands
      while (this.commandsQueue.length > 0) {
        const command = this.commandsQueue.shift()
        command()
      }
    }
  }

  async query(queryString) {
    if (!this.connected) {
      console.log(`Request queued: ${queryString}`)

      return new Promise((resolve, reject) => {
        const command = () => {
          this.query(queryString).then(resolve, reject)
        }

        this.commandsQueue.push(command)
      })
    }

    await setTimeout(100)
    console.log(`Query executed: ${queryString}`)
  }
}

export const db = new Database()
