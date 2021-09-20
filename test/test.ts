import * as path from 'path'
import Logger4 from '../build'
import {Logger4V2} from "../src";
import {Writable} from "stream";

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
    logger.on('info', info)
    logger.info('asd')
  })
})