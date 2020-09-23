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
import {MiTools, MiToolsSyncData, Tools} from '@components/canvas/Tools';
import {Canvas} from '@components/canvas/Canvas';

export class Eraser extends Tools implements MiTools {
	name = 'eraser';

	constructor(canvas: Canvas) {
		super(canvas);
		Tools.instances[this.name] = this;
	}

	draw<A extends MiToolsSyncData[]>(...args: A): void {}

	/**
	 * 准备绘制.
	 * @param event
	 */
	protected drawBegin(event: MouseEvent | PointerEvent | Touch): void {}

	/**
	 * 绘制过程.
	 * @param event
	 */
	protected drawUpdate(event: MouseEvent | PointerEvent | Touch): void {}

	/**
	 * 绘制结束.
	 * @param event
	 */
	protected drawEnd(event: MouseEvent | PointerEvent | Touch): void {}
}
