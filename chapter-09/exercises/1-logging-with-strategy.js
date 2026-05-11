/*
 * Exercise 9.1 Logging with Strategy: Implement a logging component having at
 * least the following methods: debug(), info(), warn(), and error(). The logging
 * component should also accept a strategy that defines where the log messages
 * are sent. For example, we might have ConsoleStrategy to send the messages
 * to the console, or FileStrategy to save the log messages to a file.
 * */
import { appendFile } from 'node:fs/promises'

class Logger {
  constructor(loggingStrategy) {
    this.loggingStrategy = loggingStrategy
  }

  debug(...args) {
    this.loggingStrategy.debug(`[DEBUG]: `, ...args)
  }

  info(...args) {
    this.loggingStrategy.info(`[INFO]: `, ...args)
  }

  warn(...args) {
    this.loggingStrategy.warn(`[WARN]: `, ...args)
  }

  error(...args) {
    this.loggingStrategy.error(`[ERROR]: `, ...args)
  }
}

const consoleStrategy = {
  debug(...args) {
    console.debug(...args)
  },
  info(...args) {
    console.log(...args)
  },
  warn(...args) {
    console.warn(...args)
  },
  error(...args) {
    console.error(...args)
  }
}

const appendTo = async (file, content) => {
  try {
    await appendFile(file, JSON.stringify(content) + '\n')
  } catch (err) {
    console.error('Error logging in', err.message)
  }
}

const fileStrategy = {
  debug(...args) {
    return appendTo('debug.log', args)
  },
  info(...args) {
    return appendTo('info.log', args)
  },
  warn(...args) {
    return appendTo('warn.log', args)
  },
  error(...args) {
    return appendTo('error.log', args)
  }
}

const consoleLogger = new Logger(consoleStrategy)
consoleLogger.debug('This is a debug test')
consoleLogger.info('This is a info test')
consoleLogger.warn('This is a warn test')
consoleLogger.error('This is a error test')

const fileLogger = new Logger(fileStrategy)
fileLogger.debug('This is a debug test')
fileLogger.info('This is a info test')
fileLogger.warn('This is a warn test')
fileLogger.error('This is a error test')
