/*
 * +-------------------------------------------+
 * |                  MIITVIP                  |
 * +-------------------------------------------+
 * | Copyright (c) 2020 makeit.vip             |
 * +-------------------------------------------+
 * | Author: makeit <lirongtong@hotmail.com>   |
 * | Homepage: https://www.makeit.vip          |
 * | Github: https://git.makeit.vip            |
 * | Date: 2020-9-11 18:04                     |
 * +-------------------------------------------+
 */
import {MiTools, MiToolsSyncData, Tools} from '@components/canvas/Tools';
import {Canvas} from '@components/canvas/Canvas';
import {Point} from '@components/canvas/Point';

export class Drag extends Tools implements MiTools {
	name = 'drag';
	start = new Point(0, 0);

	/**
	 * 构造.
	 * @param canvas
	 */
	constructor(canvas: Canvas) {
		super(canvas);
		Tools.instances[this.name] = this;
	}

	draw<A extends MiToolsSyncData[]>(...args: A): void {}

	/**
	 * 准备绘制.
	 * @param event
	 */
	protected drawBegin(event: MouseEvent | PointerEvent | Touch): void {
		this.start = this.createPoint(event.clientX, event.clientY);
		this.drawUpdate(event);
	}

	/**
	 * 绘制过程.
	 * @param event
	 */
	protected drawUpdate(event: MouseEvent | PointerEvent | Touch): void {
		const point = this.createPoint(event.clientX, event.clientY),
			x = point.x - this.start.x,
			y = point.y - this.start.y;
		Tools.getStage().updateTransformOrigin(x, y, true);
		this.start = point;
	}

	/**
	 * 绘制结束.
	 * @param event
	 */
	protected drawEnd(event: MouseEvent | PointerEvent | Touch): void {}
}
