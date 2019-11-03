import {Logger4Interface} from "./Logger4";

export class EmptyLogger implements Logger4Interface {
	constructor() {}

	debug(log: string, ...params: any[]) { }
	info(log: string, ...params: any[]) { }
	hidden(log: string, tag ?: string, type ?: string, ...params: any[]) { }
	error(log: string, ...params: any[]) { }
	warn(log: string, ...params: any[]) { }
	success(log: string, ...params: any[]) { }

	onError(callback: (log: string, ...params: any[]) => void) { }
	onSuccess(callback: (log: string, ...params: any[]) => void) { }
	onInfo(callback: (log: string, ...params: any[]) => void) { }
	onDebug(callback: (log: string, ...params: any[]) => void) { }
}
