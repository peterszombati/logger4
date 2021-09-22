import {Logger4, Logger4Interface} from './core/v1/Logger4'
import {EmptyLogger} from './core/v1/EmptyLogger'
import {parseError} from './utils/parseError'
import {isNodeJS} from './utils/isNodeJS'
import {Logger4V2, Logger4V2Constructor} from './core/v2/Logger4'
import {EmptyLoggerV2} from './core/v2/EmptyLogger'
import {JsonError} from './utils/JsonError'
import {isObject} from './utils/isObject'

export default Logger4

export {
  EmptyLogger,
  Logger4Interface,
  parseError,
  isNodeJS,
  Logger4V2,
  EmptyLoggerV2,
  Logger4V2Constructor,
  isObject,
  JsonError
}
