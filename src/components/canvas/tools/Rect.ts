/*
 * +-------------------------------------------+
 * |                  MIITVIP                  |
 * +-------------------------------------------+
 * | Copyright (c) 2020 makeit.vip             |
 * +-------------------------------------------+
 * | Author: makeit <lirongtong@hotmail.com>   |
 * | Homepage: https://www.makeit.vip          |
 * | Github: https://git.makeit.vip            |
 * | Date: 2020-9-9 13:21                      |
 * +-------------------------------------------+
 */
import {
	MiBrushAttrs, MiBrushRepaintConfig, MiTools,
	MiToolsSyncData, Tools
} from '@components/canvas/Tools';
import {Canvas} from '@components/canvas/Canvas';
import {Point} from '@components/canvas/Point';
import {MiRectConfig} from '@components/canvas/shapes/Rect';

export class Rect extends Tools implements MiTools {

	name = 'rect';
	start!: Point;
	solid = false;
	rect: MiRectConfig = {
		x: 0,
		y: 0,
		width: 0,
		height: 0
	}

	/**
	 * 构造.
	 * @param canvas
	 */
	constructor(canvas: Canvas) {
		super(canvas);
		Tools.instances[this.name] = this;
	}

	/**
	 * 重绘.
	 * @param args
	 */
	draw<A extends MiToolsSyncData[]>(...args: A): void {
		const data = args[0] as MiToolsSyncData,
			rect = this.setRect(data.end as Point, data.start, true) as MiRectConfig;
		this.rendering(
			{...rect, solid: data.solid},
			data.attrs,
			data.config
		)
	}

	/**
	 * 渲染.
	 * @param rect
	 * @param attrs
	 * @param config
	 */
	protected rendering(
		rect?: MiRectConfig,
		attrs?: MiBrushAttrs,
		config?: MiBrushRepaintConfig
	): void {
		rect = rect ?? {...this.rect};
		const ctx = config?.ctx ?? this.getCurrentContext();
		this.resetCtxAttrs(ctx, attrs);
		const rectangle = ({...config?.rect} ?? {}) as MiRectConfig,
			tempRect = {...rect};
		ctx.save();
		if (config) {
			/** 无限画布 */
			if (config.origin) ctx.translate(config.origin.x, config.origin.y);
			/** 移动 */
			if (config.move) {
				const isMoving = config.move.x !== 0 || config.move.y !== 0;
				if (isMoving) {
					tempRect.x += config.move.x;
					tempRect.y += config.move.y;
					rectangle.x += config.move.x;
					rectangle.y += config.move.y;
				}
			}
		}
		if (config?.selection) this.drawChoiceRect(ctx, rectangle);
		else this.drawRect(ctx, tempRect);
		ctx.restore();
	}

	/**
	 * 绘制.
	 * @param ctx
	 * @param rect
	 */
	protected drawRect(
		ctx?: CanvasRenderingContext2D,
		rect?: MiRectConfig
	): void {
		ctx = ctx ?? this.getBufferContext();
		const solid = rect ? rect.solid : this.solid;
		rect = rect ?? this.rect;
		ctx.beginPath();
		ctx.rect(
			rect.x,
			rect.y,
			rect.width,
			rect.height
		);
		ctx.closePath();
		if (solid) ctx.fill();
		else ctx.stroke();
	}

	/**
	 * 根据两点坐标, 设置方形.
	 * @param point 当前坐标点.
	 * @param start 手动控制起始坐标点.
	 * @param back 是否返回(返回时, 不设置 this.rect)
	 */
	protected setRect(
		point: Point,
		start?: Point,
		back = false
	): MiRectConfig | void {
		start = start ?? this.start;
		let rect!: MiRectConfig;
		/** 右上角移动 */
		if (point.x > start.x && point.y < start.y) {
			rect = {
				x: start.x,
				y: point.y,
				width: point.x - start.x,
				height: start.y - point.y
			};
		}
		/** 右下角移动 */
		if (point.x > start.x && point.y > start.y) {
			rect = {
				x: start.x,
				y: start.y,
				width: point.x - start.x,
				height: point.y - start.y
			};
		}
		/** 左上角移动 */
		if (point.x < start.x && point.y < start.y) {
			rect = {
				x: point.x,
				y: point.y,
				width: start.x - point.x,
				height: start.y - point.y
			};
		}
		/** 左下角移动 */
		if (point.x < start.x && point.y > start.y) {
			rect = {
				x: point.x,
				y: start.y,
				width: start.x - point.x,
				height: point.y - start.y
			};
		}
		if (rect !== undefined) {
			if (back) return rect;
			else this.rect = rect;
		}
	}

	/**
	 * 重置.
	 * @return void
	 */
	protected resetRect(): void {
		this.rect = {
			x: 0,
			y: 0,
			width: 0,
			height: 0
		};
	}

	/**
	 * 准备绘制.
	 * @param event
	 */
	protected drawBegin(event: MouseEvent | PointerEvent | Touch): void {
		this.start = this.createPoint(event.clientX, event.clientY);
		this.resetRect();
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
			this.setRect(point);
			this.drawRect();
		}
	}

	/**
	 * 绘制结束.
	 * @param event
	 */
	protected drawEnd(event: MouseEvent | PointerEvent | Touch): void {
		this.resetBuffer(() => {
			/** 重置 CTX 属性 (避免同步等情况下被覆盖) */
			const attrs = {...this.getCtxAttrs()},
				ctx = this.getCurrentContext();
			this.resetCtxAttrs(ctx, attrs);
			/** 绘制 */
			this.drawRect(ctx);
			/** 记录用于选择判断的方形并存储 */
			const end = this.createPoint(event.clientX, event.clientY),
				rect = this.getRect({...this.rect});
			const params = {
				...this.getDefaultSyncData(),
				attrs,
				start: {...this.start},
				end,
				rect,
				solid: this.solid,
				tool: this.name
			} as MiToolsSyncData;
			this.saveLayerData(params);
			Tools.setTraces();
		});
	}
}
