import * as fs from 'fs';
import * as path from 'path';
import moment = require("moment");
import {readDirectory} from "../utils/readDirectory";
import Utils from "../utils/Utils";

export interface Logger4Interface {
	red: (log: string) => void
	yellow: (log: string) => void
	green: (log: string) => void
	info: (log: string) => void
	hidden: (log: string, tag: string) => void
}

export class Logger4 implements Logger4Interface {
	private _path: string;
	private _target: string;
	constructor(_path: string) {
		this._path = _path;
		this.createNewFileName();
		this.callBeat();
		if (fs.existsSync(_path)) {
			this.checkLogDirectorySize();
		} else {
			console.error("\n" + moment().format('YYYY-MM-DD-HH-mm-ss') + " | ERROR | " + this._path + " directory is not exits (need for LoggerId)\n");
		}
	}

	private checkLogDirectorySize() {
		const directorySize = Utils.sum(readDirectory(this._path).map(f => f.stats.size));
		if (directorySize > 250000000) {
			const sizeInMB = Math.floor(directorySize / 1000000);
			this.warn(`Log directory size is more than ${sizeInMB}MB (${this._path})`);
		}
	}

	private beat() {
		if (fs.existsSync(this._path) === false) {
			console.error("\n" + moment().format('YYYY-MM-DD-HH-mm-ss') + " | ERROR | " + this._path + " directory is not exits (need for LoggerId)\n");
			return;
		}

		this.checkLogDirectorySize();

		if (fs.existsSync(this._target) === false) {
			return;
		}
		const logFileSize = fs.statSync(this._target).size;
		if (logFileSize >= 2000000) {
			this.createNewFileName();
		}
	}

	private callBeat() {
		setTimeout(() => {
			this.callBeat();
			this.beat();
		}, 600000 - (new Date().getTime() + 600000) % 600000 + 1);
	}

	private createNewFileName() {
		this._target = path.join(this._path, moment().format('YYYY-MM-DD-HH-mm-ss') + ".txt");
	}

	private save(type: string, dateStr: string, log: string) {
		try {
			fs.appendFileSync(this._target, "\n" + dateStr + " | " + type + " | " + log);
		} catch (e) {

		}
	}

	private formatLog(log: string, ...params: any[]) {
		if (params[0][0].length > 0) {
			try {
				log += " | " + JSON.stringify(params[0][0]);
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
		log = this.formatLog(log, params);
		this.save(tag, dateStr, log);
		console.log(color + dateStr + " | " + log + "\x1b[0m");
	}
	error(log: string, ...params: any[]) {
		this.print(log, "ERROR", "\x1b[31m", params);
	}
	warn(log: string, ...params: any[]) {
		this.print(log, "WARN", "\x1b[33m", params);
	}
	success(log: string, ...params: any[]) {
		this.print(log, "SUCCESS", "\x1b[32m", params);
	}
	red(log: string, ...params: any[]) {
		this.print(log, "ERROR", "\x1b[31m", params);
	}
	yellow(log: string, ...params: any[]) {
		this.print(log, "WARN", "\x1b[33m", params);
	}
	green(log: string, ...params: any[]) {
		this.print(log, "SUCCESS", "\x1b[32m", params);
	}
	info(log: string, ...params: any[]) {
		this.print(log, "INFO", "", params);
	}
	hidden(log: string, tag: string = "HIDDEN", ...params: any[]) {
		this.save(tag, Utils.getMomentDateString(), this.formatLog(log, params));
	}
}
