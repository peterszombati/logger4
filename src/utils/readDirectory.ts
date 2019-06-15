import {Stats} from "fs";

import * as fs from 'fs';
import * as path from 'path';

export function readDirectory(targetPath: string): { name: string, stats: Stats }[] | null {
	if (fs.existsSync(targetPath) === false) {
		return null;
	}
	return fs.readdirSync(targetPath).map((file: string) => {
		return {
			name: file,
			stats: fs.statSync(path.join(targetPath, file))
		};
	});
}
