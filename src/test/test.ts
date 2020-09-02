// Logger.ts
import {Logger4} from '../core/Logger4';
import * as path from 'path';

export let Logger = new Logger4({
    printEnabled: true,
    path: path.join(process.cwd(), 'log'),
    directorySizeLimitMB: 3000,
    savingEnabled: true
});

// script.ts
Logger.info('Hello World!');
Logger.info('{[0]} {[1]}', 'p1', 'p2');
