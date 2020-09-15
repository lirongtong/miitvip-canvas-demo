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
import {MiPointGroup, Point} from '@components/canvas/Point';
import {Utils} from '@components/canvas/Utils';
import {MiRectConfig} from '@components/canvas/shapes/Rect';

export class Marker extends Tools implements MiTools {

	name = 'marker';
	divisor = 4;
	protected data: MiPointGroup[] = [];

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
	draw<A extends MiToolsSyncData[]>(...args: any): void {
		const data = args[0] as MiToolsSyncData;
		this.rendering(
			data.points,
			data.attrs,
			true,
			data.config
		);
	}

	/**
	 * 渲染.
	 * @param points
	 * @param attrs
	 * @param repaint
	 * @param config
	 */
	protected rendering(
		points?: Point[],
		attrs?: MiBrushAttrs,
		repaint?: boolean,
		config?: MiBrushRepaintConfig
	): void {
		points = points ?? this.getLastPoints(this.data);
		const ctx = config?.ctx ?? this.getCurrentContext();
		this.resetCtxAttrs(ctx, attrs, this.divisor);
		/** 临时属性(避免被覆盖) */
		const tempPoints = Utils.deepCopy(points) as Point[],
			tempRect = ({...config?.rect} ?? {}) as MiRectConfig;
		ctx.save();
		if (config) {
			/** 移动 */
			if (config.move) {
				const isMoving = config.move.x !== 0 || config.move.y !== 0;
				if (isMoving) {
					this.moving(tempPoints, config.move);
					tempRect.x += config.move.x;
					tempRect.y += config.move.y;
				}
			}
		}
		/** 绘制选中框(重绘过程中...) */
		if (config?.selection) this.drawChoiceRect(ctx, tempRect, config);
		/** 正常渲染 */
		else this.drawCurve(tempPoints, ctx);
		ctx.restore();
	}

	/**
	 * 绘制.
	 * @param points
	 * @param ctx
	 */
	protected drawCurve(
		points: Point[],
		ctx?: CanvasRenderingContext2D
	): void {
		ctx = ctx ?? this.getBufferContext();
		ctx.beginPath();
		let p1 = points[0],
			p2 = points[1];
		for (let i = 1, len = points.length; i < len; i++) {
			const midPoint = this.getMidPoint(p1, p2);
			ctx.quadraticCurveTo(p1.x, p1.y, midPoint.x, midPoint.y);
			p1 = points[i];
			p2 = points[i + 1];
		}
		ctx.lineTo(p1.x, p1.y);
		ctx.stroke();
		ctx.closePath();
	}

	/**
	 * 准备绘制.
	 * @param event
	 */
	protected drawBegin(event: MouseEvent | PointerEvent | Touch): void {
		this.data.push(this.createPointGroup());
		this.buffer = this.createBuffer(this.getThickness(this.divisor));
		this.drawUpdate(event);
	}

	/**
	 * 绘制过程.
	 * @param event
	 */
	protected drawUpdate(event: MouseEvent | PointerEvent | Touch): void {
		const point = this.createPoint(event.clientX, event.clientY),
			lastPoints = this.getLastPoints(this.data),
			lastPointsLen = lastPoints.length,
			lastPoint = lastPointsLen > 0 && lastPoints[lastPointsLen - 1],
			isPointsTooClose = lastPoint ? point.distance(lastPoint) <= Tools.distance : false;
		if (!lastPoint || !(lastPoint && isPointsTooClose)) {
			lastPoints.push(point);
			this.drawCurve(lastPoints);
		}
	}

	/**
	 * 绘制结束.
	 * @param event
	 */
	protected drawEnd(event: MouseEvent | PointerEvent | Touch): void {
		this.resetBuffer(() => {
			/** 渲染 */
			this.rendering();
			const data = Utils.deepCopy(this.data),
				points = this.getLastPoints(data);
			/** 记录用于选择判断的方形并存储 */
			this.drawRectWorker(points, (rect) => {
				const params = {
					...this.getDefaultSyncData(),
					attrs: {...this.getCtxAttrs()},
					points,
					rect,
					tool: this.name
				} as MiToolsSyncData;
				this.saveLayerData(params);
			});
		});
	}
}
