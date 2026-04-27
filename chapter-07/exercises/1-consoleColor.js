/*
 * 7.1 Console color factory: Create a class called ColorConsole that has just
 * one empty method called log(). Then, create three subclasses: RedConsole,
 * BlueConsole, and GreenConsole. The log() method of every ColorConsole subclass
 * will accept a string as input and will print that string to the console using
 * the color that gives the name to the class. Then, create a factory function that
 * takes color as input, such as 'red', and returns the related ColorConsole subclass.
 * Finally, write a small command-line script to try the new console color factory.
 * You can use this Stack Overflow answer as a reference for using colors in the
 * console: nodejsdp.link/console-colors.
 * */
class ConsoleColor {
  color = '\x1b[0m'

  log(message) {
    console.log(`${this.color}%s\x1b[0m`, message)
  }
}

class RedConsole extends ConsoleColor {
  color = '\x1b[31m'
}
class BlueConsole extends ConsoleColor {
  color = '\x1b[34m'
}
class GreenConsole extends ConsoleColor {
  color = '\x1b[32m'
}

function createConsole(color) {
  switch (color) {
    case 'red':
      return new RedConsole()

    case 'blue':
      return new BlueConsole()

    case 'green':
      return new GreenConsole()

    default:
      throw new Error(`Unsupported color: ${color}`)
  }
}

const red = createConsole('red')
red.log('This message must be red')

const blue = createConsole('blue')
blue.log('This message must be blue')

const green = createConsole('green')
green.log('This message must be green')
