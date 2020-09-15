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
import {
	MiBrushAttrs, MiBrushRepaintConfig, MiTools,
	MiToolsSyncData, Tools
} from '@components/canvas/Tools';
import {Canvas} from '@components/canvas/Canvas';
import {Point} from '@components/canvas/Point';
import {MiRectConfig} from '@components/canvas/shapes/Rect';

export class Line extends Tools implements MiTools {

	name = 'line';
	start = new Point(0, 0);
	end = new Point(0, 0);

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
		const data = args[0] as MiToolsSyncData;
		this.rendering(
			data.start,
			data.end,
			data.attrs,
			data.config
		)
	}

	/**
	 * 渲染.
	 * @param start
	 * @param end
	 * @param attrs
	 * @param config
	 */
	protected rendering(
		start?: Point,
		end?: Point,
		attrs?: MiBrushAttrs,
		config?: MiBrushRepaintConfig
	): void {
		start = start ?? this.start;
		end = end ?? this.end;
		const ctx = config?.ctx ?? this.getCurrentContext(),
			rectangle = ({...config?.rect} ?? {}) as MiRectConfig;
		this.resetCtxAttrs(ctx, attrs);
		let tempStart = {...start} as Point,
			tempEnd = {...end} as Point;
		ctx.save();
		if (config) {
			/** 无限画布 */
			if (config.origin) ctx.translate(config.origin.x, config.origin.y);
			/** 移动 */
			if (config.move) {
				const isMoving = config.move.x !== 0 || config.move.y !== 0;
				if (isMoving) {
					const tempPoints = this.moving([tempStart, tempEnd], config.move);
					tempStart = tempPoints[0];
					tempEnd = tempPoints[1];
					rectangle.x += config.move.x;
					rectangle.y += config.move.y;
				}
			}
		}
		if (config?.selection) this.drawChoiceRect(ctx, rectangle);
		else this.drawLine(ctx, tempStart, tempEnd);
		ctx.restore();
	}

	/**
	 * 绘制.
	 * @param ctx
	 * @param start
	 * @param end
	 */
	protected drawLine(
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
			this.drawLine();
		}
	}

	/**
	 * 绘制结束.
	 * @param event
	 */
	protected drawEnd(event: MouseEvent | PointerEvent | Touch): void {
		this.resetBuffer(() => {
			/** 重置 CTX 属性 (避免同步等情况下被覆盖) */
			const ctx = this.getCurrentContext(),
				attrs = {...this.getCtxAttrs()};
			this.resetCtxAttrs(ctx, attrs);
			/** 渲染 */
			this.drawLine(ctx);
			const start = {...this.start},
				end = {...this.end},
				points = [start, end] as Point[];
			/** 记录用于选择判断的方形并存储 */
			this.drawRectWorker(points, (rect) => {
				const params = {
					...this.getDefaultSyncData(),
					attrs,
					start,
					end,
					rect,
					tool: this.name
				} as MiToolsSyncData;
				this.saveLayerData(params);
				Tools.getStage().draw(true);
			});
		});
	}
}
