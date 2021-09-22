import * as path from 'path'
import Logger4, {Logger4V2} from '../src'
import {Writable} from 'stream'
import {JsonError} from '../src'

describe('sandbox', () => {
  it('#0: V1 test', async () => {
    let Logger = new Logger4({
      printEnabled: true,
      path: path.join(process.cwd(), 'log'),
      directorySizeLimitMB: 3000,
      savingEnabled: true
    })

    Logger.info('Hello World!')
    Logger.info('{[0]} {[1]}', 'p1', 'p2')
  })

  it('#1: V2 test', async () => {
    const logger = new Logger4V2()
    const info = new Writable()
    info._write = ((chunk, encoding, callback) => {
      console.log(chunk.toString())
    })
    logger.onStream('info', info)
    const error = new Writable()
    error._write = ((chunk, encoding, callback) => {
      console.error(chunk.toString())
    })
    logger.onStream('error', error)
    logger.info('test')
    logger.error(new JsonError('error_message', {key: 'value'}))
  })
})