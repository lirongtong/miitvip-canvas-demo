/*
 * +-------------------------------------------+
 * |                  MIITVIP                  |
 * +-------------------------------------------+
 * | Copyright (c) 2020 makeit.vip             |
 * +-------------------------------------------+
 * | Author: makeit <lirongtong@hotmail.com>   |
 * | Homepage: https://www.makeit.vip          |
 * | Github: https://git.makeit.vip            |
 * | Date: 2020-9-11 19:48                     |
 * +-------------------------------------------+
 */
import {MiTools, Tools} from '@components/canvas/Tools';
import {Canvas} from '@components/canvas/Canvas';
import {Point} from '@components/canvas/Point';

export class Laser extends Tools implements MiTools {
	name = 'laser';
	start = new Point(0, 0);
	end = new Point(0, 0);
	protected cursor: any;
	protected laser: any;

	/**
	 * 构造.
	 * @param canvas
	 */
	constructor(canvas: Canvas) {
		super(canvas);
		Tools.instances[this.name] = this;
	}

	/**
	 * 绘制临时线.
	 * @param ctx
	 * @param start
	 * @param end
	 */
	draw(
		ctx?: CanvasRenderingContext2D,
		start?: Point,
		end?: Point
	): void {
		ctx = ctx ?? this.getBufferContext();
		start = start ?? this.start;
		end = end ?? this.end;
		ctx.beginPath();
		ctx.moveTo(start.x, start.y);
		ctx.lineTo(end.x, end.y);
		ctx.closePath();
		ctx.stroke();
	}

	/**
	 * 准备绘制.
	 * @param event
	 */
	protected drawBegin(event: MouseEvent | PointerEvent | Touch): void {
		this.start = this.createPoint(event.clientX, event.clientY);
		this.buffer = this.createBuffer();
		this.drawUpdate(event);
	}

	/**
	 * 绘制过程.
	 * @param event
	 */
	protected drawUpdate(event: MouseEvent | PointerEvent | Touch): void {
		const point = this.createPoint(event.clientX, event.clientY),
			distance = point.distance(this.start);
		if (distance >= Tools.distance) {
			this.end = point;
			this.draw();
		}
	}

	/**
	 * 绘制结束.
	 * @param event
	 */
	protected drawEnd(event: MouseEvent | PointerEvent | Touch): void {
		this.resetBuffer();
	}
}
