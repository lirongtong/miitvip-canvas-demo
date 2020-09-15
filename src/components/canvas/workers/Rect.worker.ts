/*
 * +-------------------------------------------+
 * |                  MIITVIP                  |
 * +-------------------------------------------+
 * | Copyright (c) 2020 makeit.vip             |
 * +-------------------------------------------+
 * | Author: makeit <lirongtong@hotmail.com>   |
 * | Homepage: https://www.makeit.vip          |
 * | Github: https://git.makeit.vip            |
 * | Date: 2020-9-11 16:02                     |
 * +-------------------------------------------+
 */
import {Point} from '@components/canvas/Point';

const RectWorker: Worker = self as any;

RectWorker.onmessage = (data) => {
	const points = data.data as Point[];
	let minx!: number,
		miny!: number,
		maxx!: number,
		maxy!: number;
	for (let i = 0, len = points.length; i < len; i++) {
		const point = points[i];
		if (i === 0) {
			minx = point.x;
			miny = point.y;
			maxx = point.x;
			maxy = point.y;
		} else {
			if (point.x < minx) minx = point.x;
			if (point.y < miny) miny = point.y;
			if (point.x > maxx) maxx = point.x;
			if (point.y > maxy) maxy = point.y;
		}
	}
	const x = Math.floor(minx) - 10,
		y = Math.floor(miny) - 10,
		width = Math.ceil(maxx - minx) + 20,
		height = Math.ceil(maxy - miny) + 20;
	RectWorker.postMessage({x, y, width, height});
	self.close();
};
