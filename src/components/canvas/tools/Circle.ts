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
import {MiArcConfig} from '@components/canvas/shapes/Arc';
import {MiRectConfig} from '@components/canvas/shapes/Rect';

export class Circle extends Tools implements MiTools {

	name = 'circle';                    // 工具名称
	start!: Point;                      // 起始坐标
	solid = false;                      // 是否实心(默认空心)
	radius = 0;                         // 半径
	x = 0;
	y = 0;

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
			start = new Point((data.start as Point).x, (data.start as Point).y),
			end = new Point((data.end as Point).x, (data.end as Point).y),
			radius = end.distance(start),
			arc = {
				x: end.x,
				y: end.y,
				radius,
				startAngle: 0,
				endAngle: Math.PI * 2,
				solid: data.solid
			};
		this.rendering(
			arc,
			data.attrs,
			data.config
		);
	}

	/**
	 * 渲染.
	 * @param arc
	 * @param attrs
	 * @param config
	 */
	protected rendering(
		arc?: MiArcConfig,
		attrs?: MiBrushAttrs,
		config?: MiBrushRepaintConfig
	): void {
		const ctx = config?.ctx ?? this.getCurrentContext();
		this.resetCtxAttrs(ctx, attrs);
		arc = arc ?? {
			x: this.x,
			y: this.y,
			radius: this.radius,
			startAngle: 0,
			endAngle: Math.PI * 2,
			solid: this.solid
		};
		const tempArc = {...arc},
			rectangle = ({...config?.rect} ?? {}) as MiRectConfig;
		ctx.save();
		if (config) {
			/** 无限画布 */
			if (config.origin) ctx.translate(config.origin.x, config.origin.y);
			/** 移动 */
			if (config.move) {
				const isMoving = config.move.x !== 0 || config.move.y !== 0;
				if (isMoving) {
					tempArc.x += config.move.x;
					tempArc.y += config.move.y;
					rectangle.x += config.move.x;
					rectangle.y += config.move.y;
				}
			}
		}
		if (config?.selection) this.drawChoiceRect(ctx, rectangle);
		else this.drawCicle(ctx, tempArc);
		ctx.restore();
	}

	/**
	 * 绘制.
	 * @param ctx
	 * @param arc
	 */
	protected drawCicle(
		ctx?: CanvasRenderingContext2D,
		arc?: MiArcConfig
	): void {
		ctx = ctx ?? this.getBufferContext();
		const solid = arc ? arc.solid : this.solid;
		arc = arc ?? {
			x: this.x,
			y: this.y,
			radius: this.radius,
			startAngle: 0,
			endAngle: Math.PI * 2
		} as MiArcConfig;
		ctx.beginPath();
		ctx.arc(
			arc.x,
			arc.y,
			arc.radius,
			arc.startAngle as number,
			arc.endAngle as number,
			false
		);
		if (solid) ctx.fill();
		else ctx.stroke();
	}

	/**
	 * 准备绘制.
	 * @param event
	 */
	protected drawBegin(event: MouseEvent | PointerEvent | Touch): void {
		const point = this.createPoint(event.clientX, event.clientY);
		this.start = point;
		this.x = point.x;
		this.y = point.y;
		this.buffer = this.createBuffer();
		this.drawUpdate(event);
	}

	/**
	 * 绘制过程.
	 * @param event
	 */
	protected drawUpdate(event: MouseEvent | PointerEvent | Touch): void {
		const point = this.createPoint(event.clientX, event.clientY);
		this.x = point.x;
		this.y = point.y;
		this.radius = point.distance(this.start);
		if (this.radius >= Tools.distance) this.drawCicle();
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
			this.drawCicle(ctx);
			/** 记录用于选择判断的方形并存储 */
			const arc = {
				x: this.x,
				y: this.y,
				radius: this.radius,
				startAngle: 0,
				endAngle: Math.PI * 2,
				solid: this.solid
			} as MiArcConfig,
				rect = this.getCircleRect({...arc}),
				end = {x: this.x, y: this.y};
			const params = {
				...this.getDefaultSyncData(),
				attrs,
				start: {...this.start},
				end: {...end},
				rect,
				solid: this.solid,
				tool: this.name
			} as MiToolsSyncData;
			this.saveLayerData(params);
			Tools.setTraces();
		});
	}
}
