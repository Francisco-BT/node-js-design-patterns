import { createPostStatusCmd } from './createPostStatusCmd.js'
import { statusUpdateService } from './statusUpdateService.js'
import { Invoker } from './invoker.js'

const invoker = new Invoker()
const command = createPostStatusCmd(statusUpdateService, 'HI!')

invoker.run(command)
invoker.undo()
invoker.delay(command, 1000 * 3)
