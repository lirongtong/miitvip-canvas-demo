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

export interface MiArcConfig extends MiShapeConfig {
	radius: number;
	x: number;
	y: number;
	startAngle?: number;
	endAngle?: number;
	anticlockwise?: boolean;
	solid?: boolean;
}

export class Arc extends Shape<MiArcConfig> {
	x: number;
	y: number;
	radius: number;
	anticlockwise?: boolean = false;
	startAngle: number;
	endAngle: number;

	/**
	 * 构造.
	 * @param config
	 */
	constructor(config: MiArcConfig) {
		super(config);
		this.x = config.x || 0;
		this.y = config.y || 0;
		this.startAngle = config.startAngle || -Math.PI;
		this.endAngle = config.endAngle || Math.PI;
		this.radius = config.radius;
		this.anticlockwise = config.anticlockwise;
	}

	/**
	 * 绘制.
	 * @param ctx
	 */
	public draw(ctx: CanvasRenderingContext2D): void {
		this.assign(ctx);
		ctx.save();
		ctx.beginPath();
		ctx.arc(
			this.x,
			this.y,
			this.radius,
			this.startAngle,
			this.endAngle,
			this.anticlockwise
		);
		ctx.closePath();
		ctx.clip();
		ctx.fill();
		ctx.stroke();
		ctx.restore();
	}
}
