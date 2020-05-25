import moment = require('moment');

class Utils {

	static sum(numbers: number[]) {
		let sum = 0;
		numbers.forEach(n => {
			sum += n;
		});
		return sum;
	}

	static getMomentDateTimeString() {
		const d = new Date();
		let month: number | string = (d.getUTCMonth() + 1);
		let date: number | string = d.getUTCDate();
		if (month < 10) {
			month = `0${  month}`;
		}
		if (date < 10) {
			month = `0${  date}`;
		}
		let HH: number | string = d.getUTCHours();
		let mm: number | string = d.getUTCMinutes();
		let ss: number | string = d.getUTCSeconds();
		let ms: number | string = Math.floor(d.getUTCMilliseconds() / 100);
		if (HH < 10) {
			HH = `0${HH}`;
		}
		if (mm < 10) {
			mm = `0${mm}`;
		}
		if (ss < 10) {
			ss = `0${ss}`;
		}

		return `${d.getUTCFullYear()}-${month}-${date} ${HH}:${mm}:${ss}.${ms}`;
	}

}

export default Utils;
