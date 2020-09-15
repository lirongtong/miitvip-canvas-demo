/*
 * +-------------------------------------------+
 * |                  MIITVIP                  |
 * +-------------------------------------------+
 * | Copyright (c) 2020 makeit.vip             |
 * +-------------------------------------------+
 * | Author: makeit <lirongtong@hotmail.com>   |
 * | Homepage: https://www.makeit.vip          |
 * | Github: https://git.makeit.vip            |
 * | Date: 2020-9-9 13:08                      |
 * +-------------------------------------------+
 */
declare module 'worker-loader!*' {
	class MiWorker extends Worker {
		constructor();
	}
	export default MiWorker;
}

declare module '*.png';
