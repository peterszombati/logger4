import * as fs from 'fs';
import * as path from 'path';
import moment = require('moment');
import {readDirectory} from '../utils/readDirectory';
import Utils from '../utils/Utils';
import {Listener} from "../modules/Listener";

export interface Logger4Interface {
	debug: (log: string, ...params: any[]) => void
	info: (log: string, ...params: any[]) => void
	hidden: (log: string, tag ?: string, type ?: string, ...params: any[]) => void
	error: (log: string, ...params: any[]) => void
	warn: (log: string, ...params: any[]) => void
	success: (log: string, ...params: any[]) => void

	onError: (callback: (log: string, ...params: any[]) => void) => void
	onSuccess: (callback: (log: string, ...params: any[]) => void) => void
	onInfo: (callback: (log: string, ...params: any[]) => void) => void
	onDebug: (callback: (log: string, ...params: any[]) => void) => void
	on: (tag: string, callback: (log: string, ...params: any[]) => void) => void
}

interface Target {
	[type: string]: string | null
}

export class Logger4 extends Listener implements Logger4Interface {
	private _path: string | null;
	private _target: Target = { '': null };
	private _types: string[] = [''];
	private _removeOverDirectorySizeInByte: number | null = null;
	private _timeout: NodeJS.Timeout | null = null;

	constructor({path = null, maxDirectorySizeInMB = null}: { path: string | null, maxDirectorySizeInMB: number | null }) {
		super();
		this._path = path;
		this._removeOverDirectorySizeInByte = maxDirectorySizeInMB === null ? null : maxDirectorySizeInMB * 1000000;
		this.createNewFileName('');
		this.callBeat();
		if (this._path !== null) {
			if (fs.existsSync(this._path)) {
				this.checkLogDirectorySize();
			} else {
				console.error('\n' + moment().format('YYYY-MM-DD-HH-mm-ss') + ' | ERROR | ' + this._path + ' directory is not exits (need for LoggerId)\n');
			}
		}
	}

	private addType(type: string) {
		if (this._types.includes(type) === false) {
			this._types.push(type);
		}
	}

	private getTimestamp(filename: string): number | null {
		const date = filename.split('.')[0].split('_')[0].split('-');
		if (date.length === 6) {
			const numbers = date.map(e => parseInt(e, 10));
			return Date.parse(`${numbers[0]}-${numbers[1]}-${numbers[2]} ${numbers[3]}:${numbers[4]}:${numbers[5]}`)
		} else {
			return null;
		}
	}

	private checkLogDirectorySize() {
		if (this._path === null) {
			return;
		}
		const files = readDirectory(this._path);
		if (files === null) {
			return;
		}
		const directorySize = Utils.sum(files.map(f => f.stats.size));
		if (directorySize > 1000000 * 10000) {
			const sizeInMB = Math.floor(directorySize / 1000000);
			this.warn(`Log directory size is more than ${sizeInMB}MB (${this._path})`);
		}
		if (this._removeOverDirectorySizeInByte !== null && directorySize > this._removeOverDirectorySizeInByte) {
			const deleteList: string[] = [];
			let space: number = 0;
			const minimumSpace: number = Math.floor(this._removeOverDirectorySizeInByte * 0.01);
			files.sort((a,b) => {
				const a1 = this.getTimestamp(a.name);
				const b1 = this.getTimestamp(b.name);
				if (a1 === null || b1 === null) {
					return 0;
				}
				return a1 > b1 ? 1 : -1;
			}).some(file => {
				space += file.stats.size;
				deleteList.push(file.name);
				return space > minimumSpace;
			});
			deleteList.forEach(fileName => {
				if (this._path !== null) {
					const file = path.join(this._path, fileName);
					if (this.callListener('onDeleteLog', [file]).every(({enabled}) => enabled !== false)) {
						fs.unlinkSync(file);
						this.warn(`Log file deleted (${file})`);
					}
				}
			});
		}
	}

	public onDeleteLog(callback: (file: string) => { enabled: boolean}) {
		this.addListener('onDeleteLog', callback);
	}

	private getFileName(type: string | null) {
		if (type === null || type.length === 0) {
			return this._target[''] + '.txt';
		}
		if (this._target[type] === undefined) {
			this.addType(type);
			this.createNewFileName(type);
		}
		return this._target[type] + '_' + type + '.txt';
	}

	private checkLogFiles() {
		if (this._path !== null) {
			this._types.forEach(type => {
				const fName = this.getFileName(type);
				if (fs.existsSync(fName)) {
					const logFileSize = fs.statSync(fName).size;
					if (logFileSize >= 2000000) {
						this.createNewFileName(type);
					}
				}
			});
		}
	}

	private beat() {
		if (this._path !== null) {
			if (fs.existsSync(this._path) === false) {
				console.error('\n' + moment().format('YYYY-MM-DD-HH-mm-ss') + ' | ERROR | ' + this._path + ' directory is not exits (need for Logger4)\n');
			} else {
				this.checkLogDirectorySize();
				this.checkLogFiles();
			}
		}
	}

	private callBeat() {
		this._timeout = setTimeout(() => {
			this._timeout = null;
			this.beat();
		}, 600000 - (new Date().getTime() + 600000) % 600000 + 1);
	}

	private createNewFileName(type: string) {
		if (this._path !== null) {
			this._target[type] = path.join(this._path, moment().format('YYYY-MM-DD-HH-mm-ss'));
		}
	}

	private save(tag: string, dateStr: string, log: string, type: string | null = null) {
		if (this._path !== null) {
			if (this._timeout === null) {
				this.callBeat();
			}
			try {
				fs.appendFileSync(this.getFileName(type), '\n' + dateStr + ' | ' + tag + ' | ' + log);
			} catch (e) {
				console.error(e);
			}
		}
	}

	private formatLog(log: string, ...params: any[]) {
		if (params.length > 0) {
			try {
				log += ' | ' + JSON.stringify(params);
			} catch (e) {
				this.error(e.toString());
			}
		}
		return log.split('\n').map((line,i) => {
			return (i === 0) ? line : '\t\t' + line;
		}).join('\n');
	}

	private print(log: string, tag: string, color: string, ...params: any[]) {
		const dateStr = Utils.getMomentDateString();
		log = params.length > 0 ? this.formatLog(log, ...params) : this.formatLog(log);
		this.save(tag, dateStr, log, null);
		console.log(color + dateStr + ' | ' + log + '\x1b[0m');
		this.callListener(tag, [ log, null, ...params ]);
	}
	public on(tag: string, callback: (log: string, type: string | null, ...params: any[]) => void) {
		this.addListener(tag, callback);
	}
	public onError(callback: (log: string, type: string | null, ...params: any[]) => void) {
		this.on('ERROR', callback);
	}
	public error(log: string, ...params: any[]) {
		this.print(log, 'ERROR', '\x1b[31m', ...params);
	}
	public onWarn(callback: (log: string, type: string | null, ...params: any[]) => void) {
		this.on('WARN', callback);
	}
	public warn(log: string, ...params: any[]) {
		this.print(log, 'WARN', '\x1b[33m', ...params);
	}
	public onSuccess(callback: (log: string, type: string | null, ...params: any[]) => void) {
		this.on('SUCCESS', callback);
	}
	public success(log: string, ...params: any[]) {
		this.print(log, 'SUCCESS', '\x1b[32m', ...params);
	}
	public onInfo(callback: (log: string, type: string | null, ...params: any[]) => void) {
		this.on('INFO', callback);
	}
	public info(log: string, ...params: any[]) {
		this.print(log, 'INFO', '', ...params);
	}
	public onDebug(callback: (log: string, type: string | null, ...params: any[]) => void) {
		this.on('DEBUG', callback);
	}
	public debug(log: string, ...params: any[]) {
		this.save('DEBUG', Utils.getMomentDateString(), params.length > 0 ? this.formatLog(log, ...params) : this.formatLog(log), null);
		this.callListener('DEBUG', [ log, null, ...params ]);
	}
	public hidden(log: string, tag: string = 'HIDDEN', type: string | null = null,  ...params: any[]) {
		this.save(tag, Utils.getMomentDateString(), params.length > 0 ? this.formatLog(log, ...params) : this.formatLog(log), type);
		this.callListener(tag, [ log, type, ...params ]);
	}
}
