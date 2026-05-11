/*
 * Exercise 9.2 Logging with Template: Implement the same logging component we
 * defined in the previous exercise, but this time, using the Template pattern.
 * We would then obtain a ConsoleLogger class to log to the console or a
 * FileLogger class to log to a file. Appreciate the differences between the
 * Template and the Strategy approaches.
 * */

import { appendFile } from 'node:fs/promises'

class Logger {
  debug(...args) {
    this._log('DEBUG', ...args)
  }
  info(...args) {
    this._log('INFO', ...args)
  }
  warn(...args) {
    this._log('WARN', ...args)
  }
  error(...args) {
    this._log('ERROR', ...args)
  }

  _log() {
    throw new Error('_log() must be implemented')
  }
}

class ConsoleLogger extends Logger {
  _log(level, ...args) {
    const consoleMethod = level === 'DEBUG' ? 'debug' : level.toLowerCase()
    console[consoleMethod](`[${level}]:`, ...args)
  }
}

class FileLogger extends Logger {
  async _log(level, ...args) {
    const content = args
      .map((arg) => (typeof arg === 'string' ? arg : JSON.stringify(arg)))
      .join(' ')

    try {
      const file = `${level.toLowerCase()}.log`
      await appendFile(file, `[${level}]: ${content}\n`)
    } catch (err) {
      console.error('Error logging to file: ', err.message)
    }
  }
}

const consoleLogger = new ConsoleLogger()
consoleLogger.debug('This is an info test', { id: 1 })
consoleLogger.info('This is an info test', { id: 1 })
consoleLogger.warn('This is an info test', { id: 1 })
consoleLogger.error('This is an info test', { id: 1 })

const fileLogger = new FileLogger()
fileLogger.error('This is a file error test')
