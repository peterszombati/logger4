import * as path from 'path'
import Logger4 from '../build'

describe('sandbox', () => {
    it('sandbox', async () => {
        let Logger = new Logger4({
            printEnabled: true,
            path: path.join(process.cwd(), 'log'),
            directorySizeLimitMB: 3000,
            savingEnabled: true
        })

        Logger.info('Hello World!')
        Logger.info('{[0]} {[1]}', 'p1', 'p2')
    })
})