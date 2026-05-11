export class OnlineState {
  constructor(failSafeSocket) {
    this.failSafeSocket = failSafeSocket
  }

  send(data) {
    this.failSafeSocket.queue.push(data)
    this._tryFlush()
  }

  async _tryFlush() {
    try {
      let success = true

      while (this.failSafeSocket.queue.length > 0) {
        const data = this.failSafeSocket.queue[0]
        const flushed = await this._tryWrite(data)

        if (flushed) {
          this.failSafeSocket.queue.shift()
        } else {
          success = false
          break
        }
      }

      if (!success) {
        this.failSafeSocket.changeState('offline')
      }
    } catch (err) {
      console.error(`Error during flush`, err?.message)
      this.failSafeSocket.changeState('offline')
    }
  }

  _tryWrite(data) {
    return new Promise((resolve) => {
      this.failSafeSocket.socket.write(data, (err) => {
        if (err) {
          console.error(`Error writing data`, err?.message)
          resolve(false)
        } else {
          resolve(true)
        }
      })
    })
  }

  activate() {
    this._tryFlush()
  }
}
