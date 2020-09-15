/*
 * +-------------------------------------------+
 * |                  MIITVIP                  |
 * +-------------------------------------------+
 * | Copyright (c) 2020 makeit.vip             |
 * +-------------------------------------------+
 * | Author: makeit <lirongtong@hotmail.com>   |
 * | Homepage: https://www.makeit.vip          |
 * | Github: https://git.makeit.vip            |
 * | Date: 2020-9-10 17:17                     |
 * +-------------------------------------------+
 */
import {Tools} from '@components/canvas/Tools';
import {Canvas} from '@components/canvas/Canvas';

export class Selection extends Tools {

	name = 'selection';

	constructor(canvas: Canvas) {
		super(canvas);
	}

	protected drawBegin(event: MouseEvent | PointerEvent | Touch): void {}
	protected drawUpdate(event: MouseEvent | PointerEvent | Touch): void {}
	protected drawEnd(event: MouseEvent | PointerEvent | Touch): void {}
}
