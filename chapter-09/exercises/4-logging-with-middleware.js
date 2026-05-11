/*
 * Exercise 9.4 Logging with Middleware: Rewrite the logging component you
 * implemented for exercises 9.1 and 9.2, but this time, use the Middleware
 * pattern to postprocess each log message, allowing different middlewares to
 * customize how to handle the messages and how to output them. We could, for
 * example, add a serialize() middleware to convert the log messages to a string
 * representation ready to be sent over the wire or saved somewhere. Then, we
 * could add a saveToFile() middleware that saves each message to a file. This
 * exercise should highlight the flexibility and universality of the Middleware pattern.
 * */

import { appendFile } from 'node:fs/promises'

class Logger {
  constructor() {
    this.middlewares = []
  }

  use(middleware) {
    this.middlewares.push(middleware)
  }

  async run(level, ...args) {
    let logItem = { level, data: args }

    for await (const middleware of this.middlewares) {
      try {
        logItem = await middleware(logItem)
      } catch (err) {
        console.error(`Error in middleware:`, err)
      }
    }
  }

  debug(...args) {
    return this.run('debug', ...args)
  }

  info(...args) {
    return this.run('info', ...args)
  }

  warn(...args) {
    return this.run('warn', ...args)
  }

  error(...args) {
    return this.run('error', ...args)
  }
}

const logger = new Logger()
const serialize = (logItem) => {
  return { ...logItem, text: JSON.stringify(logItem.data) }
}

const saveToFile = async (logItem) => {
  const { level, text } = logItem
  await appendFile(`${level}.log`, text + '\n')

  return logItem
}

logger.use(serialize)
logger.use(saveToFile)

logger.info('This is my first message', {
  id: 1,
  isDone: false,
  time: Date.now()
})
logger.error('This is a error message help!')
