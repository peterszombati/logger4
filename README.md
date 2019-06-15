# logger4

### Install via npm
```
npm i logger4
```

### Example usage
```ts
// Logger.ts
import Logger4 from 'logger4';
export class Logger {
	private static _log = new Logger4(path.join(process.cwd(), "logs", "log"));
	static get log() {
		return this._log;
	}

	private static _empty = new EmptyLogger();
	static get empty() {
		return this._empty;
	}
}
// script.ts
Logger.log.info("Hello World");
```
