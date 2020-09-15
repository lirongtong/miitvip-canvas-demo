/*
 * +-------------------------------------------+
 * |                  MIITVIP                  |
 * +-------------------------------------------+
 * | Copyright (c) 2020 makeit.vip             |
 * +-------------------------------------------+
 * | Author: makeit <lirongtong@hotmail.com>   |
 * | Homepage: https://www.makeit.vip          |
 * | Github: https://git.makeit.vip            |
 * | Date: 2020-9-11 11:53                     |
 * +-------------------------------------------+
 */
export interface MiShapeConfig {
	fill?: string;
	fillStyle?: string;
	stroke?: string;
	strokeStyle?: string;
	strokeWidth?: number;
	lineJoin?: string;
	lineCap?: string;
	lineWidth?: number;
	shadowBlur?: number;
	shadowColor?: string;
	globalCompositeOperation?: string;
}

export abstract class Shape<config extends MiShapeConfig = MiShapeConfig> {

	public attrs: {[index: string]: any} = {};

	/**
	 * 构造.
	 * @param config
	 */
	protected constructor(config?: config) {
		this.setAttrs(config);
	}

	/**
	 * 装配参数.
	 * @param ctx
	 */
	protected assign(ctx: CanvasRenderingContext2D) {
		const params: {[index: string]: any} = {};
		for (const i in this.attrs) {
			if (Object.prototype.hasOwnProperty.call(this.attrs, i)) {
				if (this.attrs[i] && !(i in this)) {
					params[i] = JSON.parse(JSON.stringify(this.attrs[i]));
				}
			}
		}
		Object.assign(ctx, params);
	}

	/**
	 * 获取全部属性.
	 * @return {}
	 */
	public getAttrs(): {} {
		return this.attrs;
	}

	/**
	 * 设置属性.
	 * @param config
	 */
	public setAttrs(config: any): void | Shape {
		if (!config) return this;
		for (const key in config) {
			if (Object.prototype.hasOwnProperty.call(config, key)) {
				this.attrs[key] = config[key];
			}
		}
	}
}
