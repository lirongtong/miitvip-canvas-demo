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
import {MiPointConfig, Point} from '@components/canvas/Point';
import {MiLayerData} from '@components/canvas/Layer';
import {MiRectConfig} from '@components/canvas/shapes/Rect';
import {Cursor} from '@components/canvas/Cursor';
import {Utils} from '@components/canvas/Utils';

export class Selection extends Tools {

	name = 'selection';
	start: Point = new Point(0, 0);        // 点击后, 拖拽前的原点
	static selection: string | null = null;     // 选中部分 [content, rotate, resize]
	protected data!: MiLayerData;               // 选中数据
	protected points: Point[] = [];             // 记录移动坐标 ( 用于计算移动差 )
	protected initMove: MiPointConfig = new Point(0, 0);    // 初始移动数据
	protected onceMove: MiPointConfig = new Point(0, 0);    // 单次移动数据

	/**
	 * 构造.
	 * @param canvas
	 */
	constructor(canvas: Canvas) {
		super(canvas);
		Tools.instances[this.name] = this;
	}

	/**
	 * 拖拽绘制.
	 * @param point
	 */
	protected drawContent(point: Point): void {
		let x = point.x - this.start.x,
			y = point.y - this.start.y;
		/** 右上角 */
		if (
			point.x > this.start.x &&
			point.y < this.start.y
		) {
			x = Math.abs(x);
			y = - Math.abs(y);
		}
		/** 右下角 */
		if (
			point.x > this.start.x &&
			point.y > this.start.y
		) {
			x = Math.abs(x);
			y = Math.abs(y);
		}
		/** 左上角 */
		if (
			point.x < this.start.x &&
			point.y < this.start.y
		) {
			x = - Math.abs(x);
			y = - Math.abs(y);
		}
		/** 左下角 */
		if (
			point.x < this.start.x &&
			point.y > this.start.y
		) {
			x = - Math.abs(x);
			y = Math.abs(y);
		}
		this.data.move = {
			x: this.initMove.x + x,
			y: this.initMove.y + y
		}
		this.onceMove = {x, y};
		Tools.getLayer().selection = true;
		Tools.getStage().draw();
	}

	/**
	 * 判断选中.
	 * @param event
	 */
	protected selectRect(event: MouseEvent | PointerEvent | Touch): void {
		const layer = Tools.getLayer(),
			data = layer.data,
			point = this.createPoint(event.clientX, event.clientY);
		if (layer.index !== null) {
			/** 已选中 */
			const rect = this.data.rect as MiRectConfig;
			/** 是否选中当前 */
			if (this.isPointInRect(
				point,
				rect,
				this.data.move,
				this.data.scale,
				this.data.origin
			)) {
				Selection.selection = 'content';
			} else {
				/** 回调 - 进入无选中分支, 重绘 */
				layer.index = null;
				Selection.selection = null;
				this.selectRect(event);
			}
		} else {
			/** 未选中 */
			for (let len = data.length, i = len - 1; i >= 0; i--) {
				const cur = data[i] as MiLayerData,
					rect = {...cur.rect} as MiRectConfig;
				if (rect) {
					if (this.isPointInRect(
						point,
						rect,
						cur.move,
						cur.scale,
						cur.origin
					)) {
						layer.index = i;
						Selection.selection = 'content';
						this.data = cur;
						this.initMove = {...this.data.move};
						Tools.getStage().draw();
						break;
					}
				}
			}
		}
	}

	/**
	 * 准备绘制.
	 * @param event
	 */
	protected drawBegin(event: MouseEvent | PointerEvent | Touch): void {
		this.selectRect(event);
		const layer = Tools.getLayer();
		if (layer.index !== null) {
			this.start = this.createPoint(event.clientX, event.clientY);
			layer.selection = true;
			Tools.getStage().draw();
			const cursor = Tools.getStage().cursor as Cursor;
			cursor.update(this.name, undefined, 'move');
		}
	}

	/**
	 * 绘制过程.
	 * @param event
	 */
	protected drawUpdate(event: MouseEvent | PointerEvent | Touch): void {
		if (Tools.getLayer().index !== null) {
			const point = this.createPoint(event.clientX, event.clientY),
				lastPoint = this.points[this.points.length - 1],
				isPointsTooClose = lastPoint ? point.distance(lastPoint) <= Tools.distance : false;
			if (!lastPoint || !(lastPoint && isPointsTooClose)) {
				this.points.push(point);
				if (Selection.selection === 'content') this.drawContent(point);
			}
		}
	}

	/**
	 * 绘制结束.
	 * @param event
	 */
	protected drawEnd(event: MouseEvent | PointerEvent | Touch): void {
		const layer = Tools.getLayer();
		if (layer.index !== null) {
			const index = layer.index;
			layer.index = null;
			this.points = [];
			this.resetBuffer(() => {
				const isMoving = this.onceMove.x !== 0 || this.onceMove.y !== 0;
				if (isMoving) {
					Tools.setTraces({
						operation: 'move',
						index,
						move: {...this.onceMove}
					});
				}
				this.data.move = Utils.deepCopy({
					x: this.initMove.x + this.onceMove.x,
					y: this.initMove.y + this.onceMove.y
				});
				this.onceMove = {x: 0, y: 0};
				this.initMove = {...this.data.move};
				const cursor = Tools.getStage().cursor as Cursor;
				cursor.update(this.name);
			});
		}
	}
}
