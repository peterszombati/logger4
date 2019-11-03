// Logger.ts
import {Logger4} from '../core/Logger4';
import * as path from 'path';

export let Logger = new Logger4({path: path.join(process.cwd(), 'log'), maxDirectorySizeInMB: 3000});

// script.ts
Logger.info('Hello World!');
