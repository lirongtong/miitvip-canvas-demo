/*
 * +-------------------------------------------+
 * |                  MIITVIP                  |
 * +-------------------------------------------+
 * | Copyright (c) 2020 makeit.vip             |
 * +-------------------------------------------+
 * | Author: makeit <lirongtong@hotmail.com>   |
 * | Homepage: https://www.makeit.vip          |
 * | Github: https://git.makeit.vip            |
 * | Date: 2020-9-9 13:18                      |
 * +-------------------------------------------+
 */
import {Canvas} from '@components/canvas/Canvas';
import {Utils} from '@components/canvas/Utils';
import {Stage} from '@components/canvas/Stage';
import {Layer, MiLayerData} from '@components/canvas/Layer';
import {Events} from '@components/canvas/Events';
import {throttle} from '@components/canvas/Throttle';
import {MiPoint, MiPointConfig, MiPointGroup, Point} from '@components/canvas/Point';
import {MiRectConfig, MiRectPointConfig} from '@components/canvas/shapes/Rect';
import RectWorker from 'worker-loader!./workers/Rect.worker';
import {cookie} from '@utils/cookie';
import {Rect} from '@components/canvas/shapes/Rect';
import {MiArcConfig} from '@components/canvas/shapes/Arc';

export interface MiTools {
	/**
	 * 重绘. 每个工具都需要实现该接口方法,
	 * 以便在重绘时, 统一调用.
	 * @param args
	 */
	draw(...args: any): void;
}

/** 笔刷属性 */
export interface MiBrushAttrs {
	color: string;
	thickness: number;
	opacity: number;
}

/** 可配置的笔刷属性 */
export interface MiBrushAttrsConfig {
	name?: string;
	color?: string;
	thickness?: number;
	opacity?: number;
	solid?: boolean;
	type?: string;
}

/** 重绘属性 */
export interface MiBrushRepaintConfig {
	ctx?: CanvasRenderingContext2D;             // 画布上下文
	move?: MiPointConfig;                       // 移动数据
	origin?: MiPointConfig;                     // 坐标系原点
	scale?: number;                             // 缩放比例
	rotate?: number;                            // 旋转角度
	rect?: MiRectConfig;                        // 笔刷内容所占方形(用于选择)
	text?: string;                              // 文本内容(针对文本工具)
	selection?: boolean;                        // 是否选中
	offScreen?: boolean;                        // 是否为离屏
}

/** 笔刷数据 */
export interface MiBrushData {
	name: string;
	icon: string;
	tool: string;
	solid?: boolean;
}

/** 同步 / 存储数据 */
export interface MiToolsSyncData {
	cid: number;                        // 画布Index
	lid: number;                        // 图层Index
	uid: number;                        // 用户ID
	tool: string;                       // 工具名称
	points?: Point[];                   // 笔刷坐标(存储)
	attrs?: MiBrushAttrs;               // 笔刷属性(存储)
	start?: Point;                      // 开始坐标点
	end?: Point;                        // 结束坐标点
	solid?: boolean;                    // 是否为实心 - 针对矩形/圆形
	rect?: MiRectConfig;                // 笔刷内容所占方形(用于选择)
	config?: MiBrushRepaintConfig;      // 重绘属性
}

export abstract class Tools extends Events {

	id: string;                                 // 序号
	abstract name: string;                      // 工具名称
	static color = '#000000';                   // 颜色
	static thickness = 20;                      // 粗细
	static opacity = .8;                        // 透明度
	static distance = 5;                        // 两点的最小距离(小于该值不进行绘制)
	static throttle = 16;                       // 事件更新频率(1/60 = 16ms左右的延迟[60HZ])
	repeat = false;                             // 避免触摸屏 [down/enter] 及 [leave/up] 事件冲突
	offset = 10;                                // 透明方形的偏量(比最大/小坐标稍大一些)
	enter = false;                              // 离开后进入(状态值 - 避免同步后清理临时画布时出现'进入'状态)
	toolbar = true;                             // 控制工具栏显示状态
	protected static stage: Stage;              // 整个画布(舞台)
	protected static layer: Layer;              // 图层
	protected drawing = false;                  // 绘制状态
	protected canvas: Canvas;                   // 当前画布
	protected buffer!: Canvas;                  // 离屏渲染画布
	protected ctx: CanvasRenderingContext2D;    // 当前画布对应的上下文
	protected static instances: {[index: string]: any} = {};    // 工具实例 (用于调用不同工具)
	protected static buffers: {[index: string]: any} = {};      // 临时 canvas (用于同步绘制)
	protected drawProcess: (event: MouseEvent | PointerEvent | Touch) => void;  // 移动过程中的绘制

	/**
	 * 构造.
	 * @param canvas
	 */
	protected constructor(canvas: Canvas) {
		super();
		this.id = Utils.uid();
		this.canvas = canvas;
		this.ctx = canvas.getContext();
		this.ctx.lineJoin = this.ctx.lineCap = 'round';
		const color = Utils.colorHexToRgba(Tools.color, Tools.opacity);
		this.ctx.strokeStyle = color;
		this.ctx.fillStyle = color;
		this.drawProcess = this.drawUpdate;
		if (Tools.throttle) this.drawProcess = throttle(this.drawUpdate, Tools.throttle);
	}

	/**
	 * 获取当前画布.
	 * @return {Stage}
	 */
	static getStage(): Stage {
		return Tools.stage;
	}

	/**
	 * 设置所属画布.
	 * @param stage
	 */
	static setStage(stage: Stage): void {
		Tools.stage = stage;
	}

	/**
	 * 获取当前图层.
	 * @return {Layer}
	 */
	static getLayer(): Layer {
		return Tools.layer;
	}

	/**
	 * 设置所属图层.
	 * @param layer
	 */
	static setLayer(layer: Layer): void {
		Tools.layer = layer;
	}

	/**
	 * 设置属性.
	 * @param attrs
	 */
	static setAttrs(attrs: MiBrushAttrsConfig): void {
		for (const i in attrs) {
			if (Object.prototype.hasOwnProperty.call(attrs, i)) {
				(Tools as any)[i] = (attrs as any)[i];
			}
		}
	}

	/**
	 * 移动.
	 * @param points
	 * @param move
	 */
	protected moving(
		points: Point[],
		move: MiPointConfig
	): Point[] {
		for (let i = 0, len = points.length; i < len; i++) {
			points[i].x += move.x;
			points[i].y += move.y;
		}
		return points;
	}

	/**
	 * 矩形(用于选择判断是否选中某个内容)
	 * 重绘过程中调用(一般在内容重绘完成后调用该方法, 绘制选中框)
	 * @param ctx 画布上下文
	 * @param rect 画内容时, 记录的选中框尺寸
	 * @param config 重绘配置属性(缩放/旋转等)
	 */
	protected drawChoiceRect(
		ctx: CanvasRenderingContext2D,
		rect: MiRectConfig,
		config?: MiBrushRepaintConfig
	): void {
		if (config?.rect) {
			if (config.selection) this.drawSelectionRect({...rect}, ctx)
		}
	}

	/**
	 * 绘制选中方形.
	 * @param rect
	 * @param ctx
	 */
	protected drawSelectionRect(
		rect: MiRectConfig,
		ctx?: CanvasRenderingContext2D
	): void {
		ctx = ctx ?? this.getCurrentContext();
		const color = 'rgb(47, 150, 136)';
		ctx.lineWidth = 3;
		ctx.strokeStyle = color;
		new Rect({...rect}).draw(ctx);
	}

	/**
	 * 笔刷内容的方形区域.
	 * @param points
	 * @param callback
	 */
	protected drawRectWorker(
		points: Point[],
		callback?: (rect: MiRectConfig) => void
	): void {
		const worker = new RectWorker();
		worker.postMessage(points);
		worker.onmessage = (data) => {
			const rect = data.data as MiRectConfig;
			if (typeof  callback === 'function') callback.call(this, rect);
		};
	}

	/**
	 * 设置画布上下文属性.
	 * @param color
	 * @param opacity
	 * @param ctx
	 */
	protected setCtxAttrs(
		color?: string,
		opacity?: number,
		ctx?: CanvasRenderingContext2D
	): void {
		ctx = ctx ?? this.getCurrentContext();
		color = Utils.colorHexToRgba(color ?? Tools.color, opacity ?? Tools.opacity);
		ctx.strokeStyle = color;
		ctx.fillStyle = color;
	}

	/**
	 * 重置 Ctx 属性.
	 * @param ctx
	 * @param attrs
	 * @param divisor
	 */
	protected resetCtxAttrs(
		ctx?: CanvasRenderingContext2D,
		attrs?: MiBrushAttrs,
		divisor = 10
	): void {
		ctx = ctx ?? this.getCurrentContext();
		/** 重设属性, 避免冲突(共享属性) */
		attrs = attrs ?? this.getCtxAttrs();
		ctx.lineWidth = this.getThickness(divisor, attrs.thickness);
		this.setCtxAttrs(attrs.color, attrs.opacity, ctx);
	}

	/**
	 * 笔刷粗细.
	 * @param divisor
	 * @param thickness
	 */
	protected getThickness(divisor?: number, thickness?: number): number {
		return Math.ceil((thickness ?? Tools.thickness) / (divisor ?? 10));
	}

	/**
	 * 笔刷公用属性.
	 * @return  {MiBrushAttrs}
	 */
	protected getCtxAttrs(): MiBrushAttrs {
		return {
			color: Tools.color,
			thickness: Tools.thickness,
			opacity: Tools.opacity
		}
	}

	/**
	 * 方形尺寸.
	 * @param rect
	 */
	protected getRect(rect: MiRectConfig): MiRectConfig {
		return {
			x: rect.x - this.offset,
			y: rect.y - this.offset,
			width: rect.width + (this.offset * 2),
			height: rect.height + (this.offset * 2)
		}
	}

	/**
	 * 获取圆形所占方形区域.
	 * @param arc
	 */
	protected getCircleRect(arc: MiArcConfig): MiRectConfig {
		return this.getRect({
			x: Math.ceil(arc.x - arc.radius),
			y: Math.ceil(arc.y - arc.radius),
			width: Math.ceil(arc.radius * 2),
			height: Math.ceil(arc.radius * 2)
		});
	}

	/**
	 * 离屏渲染画布上下文.
	 * @param clear 是否清除
	 */
	protected getBufferContext(clear = true): CanvasRenderingContext2D {
		const ctx = this.buffer.getContext();
		if (clear) this.buffer.clear();
		return ctx;
	}

	/**
	 * 获取当前上下文.
	 * @return CanvasRenderingContext2D
	 */
	protected getCurrentContext(): CanvasRenderingContext2D {
		return Tools.getStage().canvas.getContext();
	}

	/**
	 * 笔刷坐标数据中的最后一笔坐标数据.
	 * @param data
	 */
	protected getLastPoints(data: MiPointGroup[]): Point[] {
		const pointGroup = data[data.length - 1];
		return pointGroup.points ?? [];
	}

	/**
	 * 坐标中间点.
	 * @param p1
	 * @param p2
	 */
	protected getMidPoint(
		p1: MiPointConfig | MiPoint | Point,
		p2: MiPointConfig | MiPoint | Point
	): {
		x: number;
		y: number;
	} {
		return {
			x: p1.x + (p2.x - p1.x) / 2,
			y: p1.y + (p2.y - p1.y) / 2
		};
	}

	/**
	 * 根据2个坐标点及其粗细, 计算方形4个坐标点.
	 * @param start 开始坐标点
	 * @param end 结束坐标点
	 * @param rect
	 */
	protected getPointsBasedOn2Point(
		start: Point,
		end: Point,
		rect?: MiRectConfig
	): MiRectPointConfig {
		rect = rect ?? {x: 0, y: 0, width: 0, height: 0};
		/** 右上角移动 */
		if (end.x > start.x && end.y < start.y) {
			rect.x = start.x;
			rect.y = end.y;
			rect.width = end.x - start.x;
			rect.height = start.y - end.y;
		}
		/** 右下角移动 */
		if (end.x > start.x && end.y > start.y) {
			rect.x = start.x;
			rect.y = start.y;
			rect.width = end.x - start.x;
			rect.height = end.y - start.y;
		}
		/** 左上角移动 */
		if (end.x < start.x && end.y < start.y) {
			rect.x = end.x;
			rect.y = end.y;
			rect.width = start.x - end.x;
			rect.height = start.y - end.y;
		}
		/** 左下角移动 */
		if (end.x < start.x && end.y > start.y) {
			rect.x = end.x;
			rect.y = start.y;
			rect.width = start.x - end.x;
			rect.height = end.y - start.y;
		}
		const p1 = {x: rect.x, y: rect.y},
			p2 = {x: p1.x + rect.width, y: p1.y},
			p3 = {x: p1.x + rect.width, y: p1.y + rect.height},
			p4 = {x: p1.x, y: p1.y + rect.height};
		return {lt: p1, rt: p2, rb: p3, lb: p4};
	}

	/**
	 * 默认数据
	 */
	protected getDefaultSyncData() {
		return {
			cid: Tools.stage ? Tools.stage.index : 1,
			lid: Tools.layer ? Tools.layer.idx : 1,
			uid: cookie.get('uid') || 1,
		} as MiToolsSyncData;
	}

	/**
	 * 默认图层数据.
	 * @return any
	 */
	protected getDefaultLayerData(): any {
		return {
			move: {x: 0, y: 0},
			scale: 1,
			rotate: 0,
			visible: true
		};
	}

	/**
	 * 存储图层数据.
	 * @param params
	 */
	protected saveLayerData(params: MiToolsSyncData,): void {
		const data = {
			...this.getDefaultLayerData(),
			tool: params.tool,
			rect: params.rect,
			draw: (config: MiBrushRepaintConfig) => {
				params.config = config;
				const tool = Tools.instances[params.tool];
				if (tool) tool.draw(params);
			}
		} as MiLayerData;
		Tools.getLayer().data.push(data);
	}

	/**
	 * 创建离屏渲染画布.
	 * @param line
	 * @param color
	 */
	protected createBuffer(
		line?: number,
		color?: string
	): Canvas {
		const buffer = this.canvas.create(),
			ctx = buffer.getContext();
		color = color ?? Utils.colorHexToRgba(Tools.color, Tools.opacity);
		ctx.lineCap = ctx.lineJoin = 'round';
		ctx.lineWidth = line ?? (Tools.thickness / 10);
		ctx.strokeStyle = color;
		ctx.fillStyle = color;
		return buffer;
	}

	/**
	 * 重置离屏渲染的画布.
	 * @param callback
	 */
	protected resetBuffer(callback?: () => void): void {
		if (this.buffer && Object.keys(this.buffer).length > 0) {
			const reset = () => {
				this.buffer.remove();
				this.buffer = {} as Canvas;
				if (typeof callback === 'function') callback.call(this);
			};
			if (Tools.throttle) {
				setTimeout(() => {
					reset();
				}, Tools.throttle);
			} else reset();
		} else if (typeof callback === 'function') callback.call(this);
	}

	/**
	 * 创建坐标点.
	 * @param x
	 * @param y
	 */
	protected createPoint(
		x: number,
		y: number
	): Point {
		const rect = this.canvas.getCanvas().getBoundingClientRect();
		return new Point(
			Math.floor(x - rect.left),
			Math.floor(y - rect.top)
		);
	}

	/**
	 * 默认笔刷坐标组属性.
	 * @return {MiPointGroup}
	 */
	protected createPointGroup(): MiPointGroup {
		return {
			color: Tools.color,
			thickness: Tools.thickness,
			opacity: Tools.opacity,
			points: []
		};
	}

	/**
	 * 注册工具, 绑定元素.
	 * @param element {HTMLDivElement}
	 */
	register(element: HTMLDivElement): void {
		for (const i in this.events) {
			if (Object.prototype.hasOwnProperty.call(this.events, i)) {
				this.events[i].element = element;
			}
		}
	}

	/**
	 * 显示/隐藏 - 工具栏(本身高度70px).
	 * 鼠标移动过程中, 在接近工具栏230px时, 隐藏; 反之则显示.
	 * @return void
	 */
	protected toggleToolbar(event: PointerEvent | MouseEvent | Touch): void {
		const point = this.createPoint(event.clientX, event.clientY),
			container = Tools.getStage().container,
			offsetHeight = container.offsetHeight;
		const hide = () => {
			this.toolbar = false;
			const tools = document.getElementById('mi-canvas-tools');
			if (tools) {
				tools.style.bottom = '-70px';
				tools.style.opacity = '0';
			}
			const footer = document.getElementById('mi-canvas-footer');
			if (footer) {
				footer.style.bottom = '-70px';
				footer.style.opacity = '0';
			}
		};
		const show = () => {
			this.toolbar = true;
			const tools = document.getElementById('mi-canvas-tools');
			if (tools) {
				tools.style.bottom = '0';
				tools.style.opacity = '1';
			}
			const footer = document.getElementById('mi-canvas-footer');
			if (footer) {
				footer.style.bottom = '0';
				footer.style.opacity = '1';
			}
		};
		if (offsetHeight - point.y <= 300) {
			if (this.drawing) hide();
			else if (!this.toolbar) show();
		} else {
			if (!this.toolbar || !this.drawing) show();
		}
	}

	/**
	 * 按下.
	 * @param event
	 */
	protected pointerdown(event: PointerEvent | MouseEvent): void {
		if (!this.repeat) {
			this.repeat = true;
			this.drawing = true;
			this.enter = false;
			this.drawBegin(event);
		}
	}

	/**
	 * 进入.
	 * @param event
	 */
	protected pointerenter(event: PointerEvent | MouseEvent): void {
		if (
			event.buttons === 1 &&
			this.enter
		) {
			this.drawing = false;
			this.pointerdown(event);
		}
	}

	/**
	 * 离开
	 * @param event
	 */
	protected pointerleave(event: PointerEvent | MouseEvent): void {
		if (this.repeat) this.pointerup(event);
	}

	/**
	 * 移动.
	 * @param event
	 */
	protected pointermove(event: PointerEvent | MouseEvent): void {
		if (this.drawing) {
			if (this.toolbar) this.toggleToolbar(event);
			this.drawProcess(event);
		}
	}

	/**
	 * 抬起.
	 * @param event
	 */
	protected pointerup(event: PointerEvent | MouseEvent): void {
		if (this.drawing) {
			this.repeat = false;
			this.drawing = false;
			this.enter = true;
			this.toggleToolbar(event);
			this.drawEnd(event);
		}
	}
	/**
	 * 开始(触摸).
	 * @param event
	 */
	protected touchstart(event: TouchEvent): void {
		event.preventDefault();
		if (event.targetTouches.length === 1) {
			const touch = event.changedTouches[0];
			this.drawBegin(touch);
		}
	}

	/**
	 * 移动(触摸).
	 * @param event
	 */
	protected touchmove(event: TouchEvent): void {
		event.preventDefault();
		const touch = event.targetTouches[0];
		this.drawProcess(touch);
	}

	/**
	 * 结束(触摸).
	 * @param event
	 */
	protected touchend(event: TouchEvent): void {
		const wasContainerTouched = event.target === Tools.stage.container;
		if (wasContainerTouched) {
			event.preventDefault();
			const touch = event.changedTouches[0];
			this.drawEnd(touch);
		}
	}

	/**
	 * 触摸开始(准备绘制).
	 * @param event
	 */
	protected abstract drawBegin(event: MouseEvent | PointerEvent | Touch): void;

	/**
	 * 触摸更新(绘制过程).
	 * @param event
	 */
	protected abstract drawUpdate(event: MouseEvent | PointerEvent | Touch): void;

	/**
	 * 触摸结束(绘制结束).
	 * @param event
	 */
	protected abstract drawEnd(event: MouseEvent | PointerEvent | Touch): void;
}
