/*
 * +-------------------------------------------+
 * |                  MIITVIP                  |
 * +-------------------------------------------+
 * | Copyright (c) 2020 makeit.vip             |
 * +-------------------------------------------+
 * | Author: makeit <lirongtong@hotmail.com>   |
 * | Homepage: https://www.makeit.vip          |
 * | Github: https://git.makeit.vip            |
 * | Date: 2020-9-9 13:22                      |
 * +-------------------------------------------+
 */
import {MiShapeConfig, Shape} from '@components/canvas/Shape';

export interface MiRectConfig extends MiShapeConfig {
	x: number;
	y: number;
	width: number;
	height: number;
	radius?: number;
	solid?: boolean;
}

export class Rect extends Shape<MiRectConfig> {
	x: number;
	y: number;
	width: number;
	height: number;
	radius: number;
	solid: boolean;

	/**
	 * 构造.
	 * @param config
	 */
	constructor(config: MiRectConfig) {
		super(config);
		this.x = config.x;
		this.y = config.y;
		this.width = config.width;
		this.height = config.height;
		this.radius = config.radius ?? 0;
		this.solid = config.solid !== undefined ? config.solid : false;
	}

	/**
	 * 绘制.
	 * @param ctx
	 * @param args
	 */
	draw(
		ctx: CanvasRenderingContext2D,
		...args: any
	): void {
		this.assign(ctx);
		ctx.save();
		ctx.beginPath();
		if (this.radius) {
			const length = Math.min(this.radius, this.width / 2, this.height / 2),
				topLeft = length,
				topRight = length,
				bottomLeft = length,
				bottomRight = length;
			ctx.moveTo(this.x + topLeft, this.y);
			ctx.lineTo(this.x + this.width - topRight, this.y);
			/** 右上角弧度 */
			ctx.arc(
				this.x + this.width - topRight,
				this.y + topRight,
				topRight,
				(Math.PI * 3) / 2,
				0,
				false
			);
			ctx.lineTo(this.x + this.width, this.y + this.height - bottomRight);
			/** 右下角弧度 */
			ctx.arc(
				this.x + this.width - bottomRight,
				this.y + this.height - bottomRight,
				bottomRight,
				0,
				Math.PI / 2,
				false
			);
			ctx.lineTo(this.x + bottomLeft, this.y + this.height);
			/** 左下角弧度 */
			ctx.arc(
				this.x + bottomLeft,
				this.x + this.height - bottomLeft,
				bottomLeft,
				Math.PI / 2,
				Math.PI,
				false
			);
			ctx.lineTo(this.x, this.y + topLeft);
			/** 左上角弧度 */
			ctx.arc(
				this.x + topLeft,
				this.y + topLeft,
				topLeft,
				Math.PI,
				(Math.PI * 3) / 2,
				false
			);
		} else ctx.rect(this.x, this.y, this.width, this.height);
		ctx.closePath();
		ctx.clip();
		if (this.solid) ctx.fill();
		else ctx.stroke();
		ctx.restore();
	}
}
