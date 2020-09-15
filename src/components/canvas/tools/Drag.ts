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

export class Drag extends Tools implements MiTools {
	name = 'drag';

	constructor(canvas: Canvas) {
		super(canvas);
		Tools.instances[this.name] = this;
	}

	draw<A extends MiToolsSyncData[]>(...args: A): void {}
	protected drawBegin(event: MouseEvent | PointerEvent | Touch): void {}
	protected drawUpdate(event: MouseEvent | PointerEvent | Touch): void {}
	protected drawEnd(event: MouseEvent | PointerEvent | Touch): void {}
}
