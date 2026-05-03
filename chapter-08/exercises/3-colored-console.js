/*
 * 8.3 Colored console output: Write a decorator for the console that adds the
 * red(message), yellow(message), and green(message) methods. These methods
 * will have to behave like console.log(message) except they will print the
 * message in red, yellow, or green, respectively. In one of the exercises from
 * the previous chapter, we already pointed you to some useful packages to
 * create colored console output. If you want to try something different this time,
 * have a look at ansi-styles (nodejsdp.link/ansi-styles).
 * */

const createColorConsole = (originalConsole) => {
  const printInColor =
    (ansi) =>
    (...args) => {
      const coloredArgs = args.map((arg) =>
        typeof arg === 'string' ? `${ansi}${arg}\x1b[0m` : arg
      )

      return originalConsole.log(...coloredArgs)
    }
  const red = printInColor('\x1b[31m')
  const blue = printInColor('\x1b[34m')
  const green = printInColor('\x1b[32m')
  const yellow = printInColor('\x1b[33m')

  const decorated = Object.create(originalConsole)
  decorated.blue = blue
  decorated.green = green
  decorated.yellow = yellow
  decorated.red = red

  return decorated
}

const decoratedConsole = createColorConsole(console)

decoratedConsole.blue(
  'Hello world in blue',
  {
    id: 1,
    message: 'This is a tests'
  },
  'This is another blue message'
)
decoratedConsole.green('Hello world in green')
decoratedConsole.red('Hello world in red')
decoratedConsole.yellow('Hello world in yellow')
decoratedConsole.log('Hello world no-color')
