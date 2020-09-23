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
import {MiLayerData} from '@components/canvas/Layer';
import {MiRectConfig} from '@components/canvas/shapes/Rect';

export class Eraser extends Tools implements MiTools {

	name = 'eraser';
	type = 'select';
	protected selection?: MiLayerData;

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
	 * 移动.
	 * @param event
	 */
	protected pointermove(event: PointerEvent | MouseEvent) {
		if (
			!this.drawing &&
			this.type === 'select'
		) {
			const layer = Tools.getLayer(),
				data = layer.data,
				point = this.createPoint(event.clientX, event.clientY);
			let isIn = false;
			for (let len = data.length, i = len - 1; i >= 0; i--) {
				const cur = data[i] as MiLayerData;
				if (cur.visible) {
					const rect = {...cur.rect} as MiRectConfig;
					if (rect) {
						if (this.isPointInRect(
							point,
							rect,
							cur.move,
							cur.scale,
							cur.origin
						)) {
							isIn = true;
							if (this.selection !== cur) {
								this.selection = cur;
								layer.eraser.index = i;
								layer.eraser.selection = true;
								Tools.getStage().draw();
							}
							break;
						}
					}
				}
			}
			/** 遍历结束后 */
			if (!isIn) {
				Tools.getStage().draw();
				this.selection = undefined;
				layer.eraser.index = -1;
				layer.eraser.selection = false;
			}
		}
		super.pointermove(event);
	}

	/**
	 * 准备绘制.
	 * @param event
	 */
	protected drawBegin(event: MouseEvent | PointerEvent | Touch): void {
		const layer = Tools.getLayer();
		if (
			this.type === 'select' &&
			layer.eraser.index !== -1
		) {
			/** 选择擦除 */
			const index = layer.eraser.index;
			layer.clear(index);
		}
	}

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
