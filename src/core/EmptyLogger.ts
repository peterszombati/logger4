import {Logger4Interface} from "./Logger4";

export class EmptyLogger implements Logger4Interface {
	constructor() {}

	red(log: string) { }
	yellow(log: string) { }
	green(log: string) { }
	info(log: string) { }
	hidden(log: string, tag: string) { }
}
