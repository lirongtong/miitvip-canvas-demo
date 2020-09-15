/*
 * +-------------------------------------------+
 * |                  MIITVIP                  |
 * +-------------------------------------------+
 * | Copyright (c) 2020 makeit.vip             |
 * +-------------------------------------------+
 * | Author: makeit <lirongtong@hotmail.com>   |
 * | Homepage: https://www.makeit.vip          |
 * | Github: https://git.makeit.vip            |
 * | Date: 2020-9-11 14:22                     |
 * +-------------------------------------------+
 */
export interface MiPoint {
	x: number;
	y: number;
	time: number;
}

/** 坐标组 */
export interface MiPointGroup {
	color: string;
	thickness: number;
	opacity: number;
	points: Point[];
}

/** 坐标属性 */
export interface MiPointConfig {
	x: number;
	y: number;
}

export class Point implements MiPoint {
	x: number;
	y: number;
	time: number;

	/**
	 * 构造.
	 * @param x
	 * @param y
	 * @param time
	 */
	constructor(x: number, y: number, time?: number) {
		this.x = x;
		this.y = y;
		this.time = time || Date.now();
	}

	/**
	 * 两点直线距离.
	 * @param start
	 */
	distance(start: Point | MiPoint): number {
		return Math.sqrt(
			Math.pow(this.x - start.x, 2)
			+ Math.pow(this.y - start.y, 2)
		);
	}

	/**
	 * 判断相等.
	 * @param point
	 */
	equals(point: Point | MiPoint): boolean {
		return this.x === point.x
			&& this.y === point.y;
	}

	/**
	 * 划线速率(单位时间&单位像素)
	 * @param start
	 */
	velocity(start: Point | MiPoint): number {
		return this.time !== start.time
			? this.distance(start) / (this.time - start.time)
			: 0;
	}
}
