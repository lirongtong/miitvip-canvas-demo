/*
 * +-------------------------------------------+
 * |                  MIITVIP                  |
 * +-------------------------------------------+
 * | Copyright (c) 2020 makeit.vip             |
 * +-------------------------------------------+
 * | Author: makeit <lirongtong@hotmail.com>   |
 * | Homepage: https://www.makeit.vip          |
 * | Github: https://git.makeit.vip            |
 * | Date: 2020-9-9 13:23                      |
 * +-------------------------------------------+
 */
export function throttle(fn: (...args: any[]) => any, wait = 1000): any {
	let previous = 0;
	let timeout: number | null = null;
	let result: any;
	let storedContext: any;
	let storedArgs: any[];
	const later = () => {
		previous = Date.now();
		timeout = null;
		result = fn.apply(storedContext, storedArgs);
		if (!timeout) {
			storedContext = null;
			storedArgs = [];
		}
	};
	return function wrapper(this: any, ...args: any[]) {
		const now = Date.now();
		const remaining = wait - (now - previous);
		storedContext = this;
		storedArgs = args;
		if (remaining <= 0 || remaining > wait) {
			if (timeout) {
				clearTimeout(timeout);
				timeout = null;
			}
			previous = now;
			result = fn.apply(storedContext, storedArgs);
			if (!timeout) {
				storedContext = null;
				storedArgs = [];
			}
		} else if (!timeout) {
			timeout = setTimeout(later, remaining);
		}
		return result;
	}
}
