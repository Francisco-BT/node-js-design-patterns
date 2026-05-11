import { createConnection } from 'node:net'

export class OfflineState {
  constructor(failSafeSocket) {
    this.failSafeSocket = failSafeSocket
  }

  send(data) {
    this.failSafeSocket.queue.push(data)
  }

  activate() {
    const retry = () => {
      setTimeout(() => this.activate(), 1000)
    }

    console.log(
      `Trying to connect (${this.failSafeSocket.queue.length} queued messages)`
    )
    this.failSafeSocket.socket = createConnection(
      this.failSafeSocket.options,
      () => {
        console.log('Connection stablished')
        this.failSafeSocket.socket.removeListener('error', retry)
        this.failSafeSocket.changeState('online')
      }
    )
    this.failSafeSocket.socket.once('error', retry)
  }
}
