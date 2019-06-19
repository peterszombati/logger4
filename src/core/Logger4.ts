import * as fs from 'fs';
import * as path from 'path';
import moment = require("moment");
import {readDirectory} from "../utils/readDirectory";
import Utils from "../utils/Utils";

export interface Logger4Interface {
	red: (log: string, ...params: any[]) => void
	yellow: (log: string, ...params: any[]) => void
	green: (log: string, ...params: any[]) => void
	info: (log: string, ...params: any[]) => void
	hidden: (log: string, tag ?: string, type ?: string, ...params: any[]) => void
	error: (log: string, ...params: any[]) => void
	warn: (log: string, ...params: any[]) => void
	success: (log: string, ...params: any[]) => void
	addType: (type: string) => void
}

export class Logger4 implements Logger4Interface {
	private _path: string;
	private _target: string;
	private _types: string[] = [""];
	private _removeOverDirectorySize: number = null;

	constructor({path, removeOverDirectorySize = null}: { path: string, removeOverDirectorySize: number | null }) {
		this._path = path;
		this._removeOverDirectorySize = removeOverDirectorySize;
		this.createNewFileName();
		this.callBeat();
		if (fs.existsSync(path)) {
			this.checkLogDirectorySize();
		} else {
			console.error("\n" + moment().format('YYYY-MM-DD-HH-mm-ss') + " | ERROR | " + this._path + " directory is not exits (need for LoggerId)\n");
		}
	}

	public addType(type: string) {
		if (this._types.includes(type) === false) {
			this._types.push(type);
		}
	}
/*TODO clean directory feature
	private getTimestamp(filename: string) {
		const date = filename.split('.')[0].split('_')[0].split("-");
		if (date.length !== 6) {
			return null;
		}
		const numbers = date.map(e => parseInt(e, 10));
		return Date.parse(`${numbers[0]}-${numbers[1]}-${numbers[2]} ${numbers[3]}:${numbers[4]}:${numbers[5]}`)
	}
*/
	private checkLogDirectorySize() {
		const files = readDirectory(this._path);
		const directorySize = Utils.sum(files.map(f => f.stats.size));
		if (directorySize > 1000000000) {
			const sizeInMB = Math.floor(directorySize / 1000000);
			this.warn(`Log directory size is more than ${sizeInMB}MB (${this._path})`);
		}
		/*TODO clean directory feature
		if (this._removeOverDirectorySize !== null && directorySize > 10000000000) {
			files.sort((a,b) => {
				return this.getTimestamp(a.name) > this.getTimestamp(b.name) ? 1 : -1;
			});
		}*/
	}

	private checkLogFiles() {
		this._types.forEach(type => {
			if (fs.existsSync(this._target + type + ".txt") === false) {
				return;
			}
			const logFileSize = fs.statSync(this._target + type + ".txt").size;
			if (logFileSize >= 2000000) {
				this.createNewFileName();
			}
		});
	}

	private beat() {
		if (fs.existsSync(this._path) === false) {
			console.error("\n" + moment().format('YYYY-MM-DD-HH-mm-ss') + " | ERROR | " + this._path + " directory is not exits (need for LoggerId)\n");
			return;
		}

		this.checkLogDirectorySize();
		this.checkLogFiles();
	}

	private callBeat() {
		setTimeout(() => {
			this.callBeat();
			this.beat();
		}, 600000 - (new Date().getTime() + 600000) % 600000 + 1);
	}

	private createNewFileName() {
		this._target = path.join(this._path, moment().format('YYYY-MM-DD-HH-mm-ss'));
	}

	private save(tag: string, dateStr: string, log: string, type: string = "") {
		try {
			fs.appendFileSync(this._target + (type === null ? "" : "_" + type) + ".txt", "\n" + dateStr + " | " + tag + " | " + log);
		} catch (e) {
			//TODO: it should be handled
		}
	}

	private formatLog(log: string, ...params: any[]) {
		if (params.length > 0) {
			try {
				log += " | " + JSON.stringify(params);
			} catch (e) {
				this.error(e.toString());
			}
		}
		return log.split("\n").map((line,i) => {
			return (i === 0) ? line : "\t\t" + line;
		}).join("\n");
	}

	private print(log: string, tag: string, color: string, ...params: any[]) {
		const dateStr = Utils.getMomentDateString();
		log = params.length > 0 ? this.formatLog(log, params) : this.formatLog(log);
		this.save(tag, dateStr, log, "");
		console.log(color + dateStr + " | " + log + "\x1b[0m");
	}

	error(log: string, ...params: any[]) {
		if (params.length === 0) {
			this.print(log, "ERROR", "\x1b[31m");
		} else {
			this.print(log, "ERROR", "\x1b[31m", params);
		}
	}
	warn(log: string, ...params: any[]) {
		if (params.length === 0) {
			this.print(log, "WARN", "\x1b[33m");
		} else {
			this.print(log, "WARN", "\x1b[33m", params);
		}
	}
	success(log: string, ...params: any[]) {
		if (params.length === 0) {
			this.print(log, "SUCCESS", "\x1b[32m");
		} else {
			this.print(log, "SUCCESS", "\x1b[32m", params);
		}
	}
	red(log: string, ...params: any[]) {
		if (params.length === 0) {
			this.print(log, "ERROR", "\x1b[31m");
		} else {
			this.print(log, "ERROR", "\x1b[31m", params);
		}
	}
	yellow(log: string, ...params: any[]) {
		if (params.length === 0) {
			this.print(log, "WARN", "\x1b[33m");
		} else {
			this.print(log, "WARN", "\x1b[33m", params);
		}
	}
	green(log: string, ...params: any[]) {
		if (params.length === 0) {
			this.print(log, "SUCCESS", "\x1b[32m");
		} else {
			this.print(log, "SUCCESS", "\x1b[32m", params);
		}
	}
	info(log: string, ...params: any[]) {
		if (params.length === 0) {
			this.print(log, "INFO", "");
		} else {
			this.print(log, "INFO", "", params);
		}
	}
	hidden(log: string, tag: string = "HIDDEN", type: string = null,  ...params: any[]) {
		this.save(tag, Utils.getMomentDateString(), params.length > 0 ? this.formatLog(log, params) : this.formatLog(log), type);
	}
}
