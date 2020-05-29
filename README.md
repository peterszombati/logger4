# logger4

### Install via [npm](https://www.npmjs.com/package/logger4)
```
npm i logger4
```

### Example usage
```ts
// Logger.ts
import Logger4 from 'logger4';
import * as path from 'path';

export let Logger = new Logger4({
    printEnabled: true,
    path: path.join(process.cwd(), 'log'),
    directorySizeLimitMB: 3000
});

// script.ts
Logger.info('Hello World!');
Logger.info('{[0]} {[1]}', 'p1', 'p2');
```
