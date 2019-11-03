import moment = require('moment');

class Utils {

	static sum(numbers: number[]) {
		let sum = 0;
		numbers.forEach(n => {
			sum += n;
		});
		return sum;
	}

	static getMomentDateString() {
		return moment().format('YYYY-MM-DD HH:mm:ss');
	}

}

export default Utils;
