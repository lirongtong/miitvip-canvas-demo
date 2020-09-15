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
import {MiBrushAttrs, MiBrushRepaintConfig, MiTools, MiToolsSyncData, Tools} from '@components/canvas/Tools';
import {Canvas} from '@components/canvas/Canvas';
import {Point} from '@components/canvas/Point';
import {Utils} from '@components/canvas/Utils';
import {MiRectConfig} from '@components/canvas/shapes/Rect';

export interface MiArrowConfig {
	start: {x: number; y: number};
	vertex: {
		center: {x: number; y: number};
		left: {x: number; y: number};
		right: {x: number; y: number};
		mid: {
			left: {x: number; y: number};
			right: {x: number; y: number};
		};
	};
}

export class Arrow extends Tools implements MiTools {
	name = 'arrow';
	angle = 25;
	radian = 0;
	edgeLength = 50;
	divisor = 5;
	start = new Point(0, 0);
	end = new Point(0, 0);
	polygon: MiArrowConfig = {
		start: {x: 0, y: 0},
		vertex: {
			center: {x: 0, y: 0},
			left: {x: 0, y: 0},
			right: {x: 0, y: 0},
			mid: {
				left: {x: 0, y: 0},
				right: {x: 0, y: 0}
			}
		}
	};

	/**
	 * 构造.
	 * @param canvas
	 */
	constructor(canvas: Canvas) {
		super(canvas);
		Tools.instances[this.name] = this;
		Object.defineProperty(this, 'arrowLength', {
			get() {return Tools.thickness / 2 < 10 ? 10 : Tools.thickness / 2;}
		});
	}

	/**
	 * 重绘.
	 * @param args
	 */
	draw<A extends MiToolsSyncData[]>(...args: A): void {
		const data = args[0] as MiToolsSyncData,
			start = new Point((data.start as Point).x, (data.start as Point).y),
			end = new Point((data.end as Point).x, (data.end as Point).y);
		this.getArrowCord(start, end);
		this.getSizeCord();
		const polygon = {...this.polygon};
		this.rendering(
			polygon,
			data.attrs,
			data.config
		);
	}

	/**
	 * 渲染.
	 * @param polygon
	 * @param attrs
	 * @param config
	 */
	protected rendering(
		polygon: MiArrowConfig,
		attrs?: MiBrushAttrs,
		config?: MiBrushRepaintConfig
	): void {
		const ctx = config?.ctx ?? this.getCurrentContext();
		this.resetCtxAttrs(ctx, attrs);
		const points = Utils.deepCopy(this.getArrowRect(polygon)),
			tempPolygon = Utils.deepCopy(polygon),
			rectangle = ({...config?.rect} ?? {}) as MiRectConfig;
		ctx.save();
		if (config) {
			/** 无限画布 */
			if (config.origin) ctx.translate(config.origin.x, config.origin.y);
			/** 移动 */
			if (config.move) {
				const isMoving = config.move.x !== 0 || config.move.y !== 0;
				if (isMoving) {
					const tempPoints = this.moving(points, config.move);
					/** 当前绘图临时坐标 */
					tempPolygon.start = tempPoints[0];
					tempPolygon.vertex.mid.right = tempPoints[1];
					tempPolygon.vertex.right = tempPoints[2];
					tempPolygon.vertex.center = tempPoints[3];
					tempPolygon.vertex.left = tempPoints[4];
					tempPolygon.vertex.mid.left = tempPoints[5];
					/** 矩形 */
					rectangle.x += config.move.x;
					rectangle.y += config.move.y;
				}
			}
		}
		if (config?.selection) this.drawChoiceRect(ctx, rectangle);
		else this.drawArrow(ctx, tempPolygon);
		ctx.restore();
	}

	/**
	 * 绘制.
	 * @param ctx
	 * @param polygon
	 */
	protected drawArrow(
		ctx?: CanvasRenderingContext2D,
		polygon?: MiArrowConfig
	): void {
		ctx = ctx ?? this.getBufferContext();
		ctx.beginPath();
		polygon = polygon ?? this.polygon;
		ctx.moveTo(polygon.start.x, polygon.start.y);
		ctx.lineTo(polygon.vertex.mid.right.x, polygon.vertex.mid.right.y);
		ctx.lineTo(polygon.vertex.right.x, polygon.vertex.right.y);
		ctx.lineTo(polygon.vertex.center.x, polygon.vertex.center.y);
		ctx.lineTo(polygon.vertex.left.x, polygon.vertex.left.y);
		ctx.lineTo(polygon.vertex.mid.left.x, polygon.vertex.mid.left.y);
		ctx.closePath();
		ctx.fill();
	}

	/**
	 * 起点与x轴之间的角度值.
	 * @param start
	 * @param end
	 */
	protected getRadian(
		start: Point,
		end: Point
	): void {
		this.radian = Math.atan2(end.y - start.y, end.x - start.x) / Math.PI * 180;
		this.setArrowSizeDefault(50, 25);
		this.setArrowSize(start, end);
	}

	/**
	 * 箭头顶部三角形左右两边的点.
	 * @param start
	 * @param end
	 */
	protected getArrowCord(
		start: Point,
		end: Point
	): MiArrowConfig | void {
		this.polygon.start.x = start.x;
		this.polygon.start.y = start.y;
		this.polygon.vertex.center.x = end.x;
		this.polygon.vertex.center.y = end.y;
		this.getRadian(start, end);
		this.polygon.vertex.left.x = end.x - this.edgeLength * Math.cos(Math.PI / 180 * (this.radian + this.angle));
		this.polygon.vertex.left.y = end.y - this.edgeLength * Math.sin(Math.PI / 180 * (this.radian + this.angle));
		this.polygon.vertex.right.x = end.x - this.edgeLength * Math.cos(Math.PI / 180 * (this.radian - this.angle));
		this.polygon.vertex.right.y = end.y - this.edgeLength * Math.sin(Math.PI / 180 * (this.radian - this.angle));
	}

	/**
	 * 获取箭头用于选择的矩形.
	 * @param polygon
	 */
	protected getArrowRect(
		polygon?: MiArrowConfig
	): Point[] {
		polygon = polygon ?? this.polygon;
		return [
			new Point(polygon.start.x, polygon.start.y),
			new Point(polygon.vertex.mid.right.x, polygon.vertex.mid.right.y),
			new Point(polygon.vertex.right.x, polygon.vertex.right.y),
			new Point(polygon.vertex.center.x, polygon.vertex.center.y),
			new Point(polygon.vertex.left.x, polygon.vertex.left.y),
			new Point(polygon.vertex.mid.left.x, polygon.vertex.mid.left.y)
		];
	}

	/**
	 * 底部三角形除了两边外, 再取2个点作为连接点.
	 * 取三角左边点到三角底部中间点的中间点(右边的点同理).
	 * @return void
	 */
	protected getSizeCord(polygon?: MiArrowConfig): void {
		polygon = polygon ?? this.polygon;
		const midPoint: {x: number; y: number} = {x: 0, y: 0};
		midPoint.x = (polygon.vertex.right.x + polygon.vertex.left.x) / 2;
		midPoint.y = (polygon.vertex.right.y + polygon.vertex.left.y) / 2;
		this.polygon.vertex.mid.left.x = (polygon.vertex.left.x + midPoint.x) / 2;
		this.polygon.vertex.mid.left.y = (polygon.vertex.left.y + midPoint.y) / 2;
		this.polygon.vertex.mid.right.x = (polygon.vertex.right.x + midPoint.x) / 2;
		this.polygon.vertex.mid.right.y = (polygon.vertex.right.y + midPoint.y) / 2;
	}

	/**
	 * 默认值.
	 * @param angle
	 * @param edgeLength
	 */
	protected setArrowSizeDefault(
		angle: number,
		edgeLength: number
	): void {
		this.angle = angle;
		this.edgeLength = edgeLength;
	}

	/**
	 * 设置箭头尺寸(避免短距离箭头头部过大).
	 * @return void
	 */
	protected setArrowSize(
		start?: Point,
		end?: Point
	): void {
		start = start ?? this.start;
		end = end ?? this.end;
		const distance = end.distance(start);
		if (distance < 250) {
			this.angle = this.angle / 2;
			this.edgeLength = this.edgeLength / 2;
		} else if (distance < 500) {
			this.angle = this.angle * distance / 500;
			this.edgeLength = this.edgeLength * distance / 500;
		}
	}

	/**
	 * 准备绘制.
	 * @param event
	 */
	protected drawBegin(event: MouseEvent | PointerEvent | Touch): void {
		this.setCtxAttrs();
		this.getCurrentContext().lineWidth = this.getThickness(this.divisor);
		this.start = this.createPoint(event.clientX, event.clientY);
		this.buffer = this.createBuffer(this.getThickness(this.divisor));
		this.drawUpdate(event);
	}

	/**
	 * 绘制过程.
	 * @param event
	 */
	protected drawUpdate(event: MouseEvent | PointerEvent | Touch): void {
		const point = this.createPoint(event.clientX, event.clientY);
		const distance = point.distance(this.start);
		if (distance >= Tools.distance) {
			this.end = point;
			this.getArrowCord(this.start, this.end);
			this.getSizeCord();
			this.drawArrow();
		}
	}

	/**
	 * 绘制结束.
	 * @param event
	 */
	protected drawEnd(event: MouseEvent | PointerEvent | Touch): void {
		this.resetBuffer(() => {
			/** 渲染 */
			this.getArrowCord(this.start, this.end);
			this.getSizeCord();
			this.drawArrow(this.getCurrentContext());
			/** 记录用于选择判断的方形并存储 */
			this.drawRectWorker(this.getArrowRect(), (rect) => {
				const params = {
					...this.getDefaultSyncData(),
					attrs: {...this.getCtxAttrs()},
					start: {...this.start},
					end: {...this.end},
					rect,
					tool: this.name
				} as MiToolsSyncData;
				this.saveLayerData(params);
			});
		});
	}
}
