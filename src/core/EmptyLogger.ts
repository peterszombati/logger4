import {Logger4Interface} from "./Logger4";

export class EmptyLogger implements Logger4Interface {
	constructor() {}

	red(log: string, ...params: any[]) { }
	yellow(log: string, ...params: any[]) { }
	green(log: string, ...params: any[]) { }
	info(log: string, ...params: any[]) { }
	hidden(log: string, tag ?: string, type ?: string, ...params: any[]) {}
	error(log: string, ...params: any[]) { }
	warn(log: string, ...params: any[]) { }
	success(log: string, ...params: any[]) { }
	addType(type: string) { }

}
