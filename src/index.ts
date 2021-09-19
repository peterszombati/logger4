import {Logger4, Logger4Interface} from './core/v1/Logger4'
import {EmptyLogger} from './core/v1/EmptyLogger'
import {parseError} from './utils/parseError'
import {isNodeJS} from './utils/isNodeJS'

export default Logger4

export {EmptyLogger, Logger4Interface, parseError, isNodeJS}
