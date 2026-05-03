/*
 * 8.2 Timestamped logs: Create a proxy for the console object that enhances
 * every logging function (log(), error(), debug(), and info()) by prepending
 * the current timestamp to the message you want to print in the logs.
 * For instance, executing consoleProxy.log('hello') should print something
 * like 2020-02-18T15:59:30.699Z hello in the console.
 * */

const allowedLogs = ['log', 'error', 'info', 'debug']

const consoleLogHandler = {
  get(target, property) {
    if (allowedLogs.includes(property)) {
      return (...args) => {
        const timestamp = new Date().toISOString()

        return target[property](timestamp, ...args)
      }
    }

    return target[property]
  }
}

const consoleProxy = new Proxy(console, consoleLogHandler)

consoleProxy.log('hello')
const err = new Error('Something went wrong')
err.code = 2342
consoleProxy.error('This is an error example:', err)

const data = [
  { id: 1, success: true },
  { id: 2, success: false }
]
consoleProxy.table(data)

consoleProxy.info('This is a info message')
consoleProxy.debug('This is a debug message')
