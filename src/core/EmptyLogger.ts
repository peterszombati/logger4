import {Logger4Interface} from './Logger4';

export class EmptyLogger implements Logger4Interface {
	constructor() {}

	path: string | null = null;
	debug() { }
	info() { }
	hidden() { }
	error() { }
	warn() { }
	success() { }

	onError() { }
	onSuccess() { }
	onInfo() { }
	onDebug() { }
	onTag() { }
	on() { }
}
