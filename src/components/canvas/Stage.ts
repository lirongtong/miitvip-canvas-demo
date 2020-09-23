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
import {Base} from '@components/canvas/Base';
import {MiBrushAttrs, MiBrushAttrsConfig, Tools} from '@components/canvas/Tools';
import {Utils} from '@components/canvas/Utils';
import {Canvas} from '@components/canvas/Canvas';
import {Marker} from '@components/canvas/tools/Marker';
import {Selection} from '@components/canvas/tools/Selection';
import {Layer, MiLayerData} from '@components/canvas/Layer';
import {Cursor} from '@components/canvas/Cursor';
import {Drag} from '@components/canvas/tools/Drag';
import {Rect} from '@components/canvas/tools/Rect';
import {Circle} from '@components/canvas/tools/Circle';
import {Line} from '@components/canvas/tools/Line';
import {Eraser} from '@components/canvas/tools/Eraser';
import {Text} from '@components/canvas/tools/Text';
import {Arrow} from '@components/canvas/tools/Arrow';
import {Laser} from '@components/canvas/tools/Laser';
import {Screenshot} from '@components/canvas/tools/Screenshot';
import {MiRectConfig} from '@components/canvas/shapes/Rect';
import {MiPointConfig} from '@components/canvas/Point';

declare global {
	interface Window {
		PointerEvent: typeof PointerEvent;
	}
}

/** 记录 stages */
export const stages: {[index: string]: Stage} = {};

/** 初始化画布所支持属性 */
export interface MiStageConfig {
	container: string | HTMLDivElement;
	width?: number;
	height?: number;
	buffer?: boolean;
	reset?: boolean;
	background?: string;
}

/** 操作踪迹 */
export interface MiStageTracesConfig {
	operation?: string;             // 操作名称
	index?: number;                 // 操作的数据索引
	indexes?: any[];                // 批量操作 (清屏...)
	move?: MiPointConfig;           // 移动距离
	active?: {
		attrs: MiBrushAttrs;        // 属性 ( 便于颜色/粗细的恢复 )
		rect: MiRectConfig;         // 方形属性
	};
	old?: {
		attrs: MiBrushAttrs;        // 属性 ( 便于颜色/粗细的恢复 )
		rect: MiRectConfig;         // 方形属性
	};
}

/** 集成 Base 基类 */
export abstract class MiStage extends Base {
	protected abstract register(tools: Tools): void;
}

export class Stage extends MiStage {

	id: string;                                             // 序号
	index = 0;                                              // 画布索引(决定图层叠加先后顺序)
	container: HTMLDivElement;                              // 容器
	width: number;                                          // 宽度
	height: number;                                         // 高度
	background = '#f6f6f6';                                 // 画布背景色
	transparent = false;                                    // 画布透明
	tool = 'selection';                                     // 选中的工具
	tools: {[index: string]: any} = {};                     // 工具列表
	canvas: Canvas;                                         // 画布
	cursor!: Cursor;                                        // 光标
	layer!: Layer;                                          // 选中的图层
	layers: {[index: string]: Layer} = {};                  // 图层列表
	traces: any[] = [];                                     // 操作踪迹 (回撤)
	recoveries: any[] = [];                                 // 待恢复列表 (恢复)
	protected events: any[] = [];                           // 记录注册事件

	/**
	 * 构造.
	 * @param config
	 * @param index
	 */
	constructor(
		config: MiStageConfig,
		index?: number
	) {
		super();
		this.id = Utils.uid();
		this.container = (
			config.container instanceof HTMLDivElement
				? config.container
				: document.getElementById(config.container as string)
		) as HTMLDivElement;
		this.width = config.width ?? this.container.offsetWidth ?? 0;
		this.height = config.height ?? this.container.offsetHeight ?? 0;
		/** index */
		this.index = 1;
		if (index) {
			this.index = index;
		} else {
			const keys = Object.keys(stages);
			if (keys.length > 0) {
				if (config.buffer) this.index = Tools.getStage().index;
				else this.index = stages[keys[keys.length - 1]].index + 1;
			}
		}
		/** canvas */
		this.canvas = new Canvas({
			width: this.width,
			height: this.height,
			background: config.background ?? this.background
		});
		this.container.appendChild(this.canvas.getCanvas());
		/** 清空 stages */
		if (config.reset) this.reset();
		/** 离屏渲染画布 (不加入画布列表, 避免重复注册事件) */
		if (!config.buffer) {
			/** 注册工具 */
			this.registerTools();
			/** 注册事件 */
			this.registerEvents();
			/** 光标 */
			this.cursor = new Cursor({container: this.container});
			/** 记录 */
			stages[this.id] = this;
			/** 设置选中画布 */
			Tools.setStage(this);
		}
	}

	/**
	 * 获取当前 Stage 实例.
	 * @param id
	 */
	get(id?: string): Stage {
		return id ? stages[id] : this;
	}

	/**
	 * 添加图层.
	 * @param layer
	 */
	add(layer: Layer): void {
		this.layer = layer;
		this.layers[layer.id] = layer;
		/** 记录当前所属图层 */
		Tools.setLayer(this.layer);
	}

	/**
	 * 删除图层.
	 * @param id
	 */
	remove(id: string): void {
		delete this.layers[id];
		this.draw(true);
	}

	/**
	 * 图层状态(显示/隐藏).
	 * @param id
	 */
	state(id: string): void {
		if (this.layers[id]) this.layers[id].hidden = !this.layers[id].hidden;
		this.draw(true);
	}

	/**
	 * 绘制指定画布的所有内容.
	 * @param reset
	 * @param ctx
	 */
	draw(
		reset = false,
		ctx?: CanvasRenderingContext2D
	): void {
		this.canvas.clear();
		const keys = Object.keys(this.layers),
			len = keys.length;
		for (let i = 0; i < len; i++) {
			const cur = this.layers[keys[i]] as Layer;
			if (reset) cur.index = null;
			cur.draw(ctx);
		}
	}

	/**
	 * 删除画布.
	 * @param selection
	 */
	delete(selection: any[] | string): any[] {
		const ids: any[] = [];
		if (Array.isArray(selection)) {
			for (let i = 0, len = selection.length; i < len; i++) {
				if (stages[selection[i]]) {
					ids.push(stages[selection[i]].canvas.id);
					delete stages[selection[i]];
				}
			}
		} else {
			ids.push(stages[selection].canvas.id);
			delete stages[selection];
		}
		return ids;
	}

	/**
	 * 注册工具(单个).
	 * @param tools
	 */
	protected register(tools: Tools): void {
		tools.register(this.container);
		this.tools[tools.name] = tools;
	}

	/**
	 * 事件绑定.
	 * @param event
	 * @param callback
	 */
	on(
		event: keyof HTMLElementEventMap,
		callback?: (e: HTMLElementEventMap[keyof HTMLElementEventMap]) => any
	): void {
		if (
			this.container &&
			this.container instanceof HTMLDivElement
		) {
			let binding = false;
			for (let i = 0, len = this.events.length; i < len; i++) {
				const cur = this.events[i];
				if (
					cur.event === event &&
					cur.element === this.container
				) {
					binding = true;
					break;
				}
			}
			if (!binding) {
				const ev = {
					element: this.container,
					event,
					func: callback
				};
				this.events.push(ev);
				Utils.on(ev.element, event, (evt) => {
					const active = this.getActiveTool(),
						tool = this.tools[active] as Tools;
					if (Tools.getStage().id === this.id && tool) {
						if (tool.name === active) {
							/** 触发工具事件 */
							tool.fireEvent(event, evt);
						} else if (callback) {
							/** 注册新工具&事件 */
							tool.registerEvent(event, callback);
							tool.register(ev.element);
						}
					}
				});
			}
		}
	}

	/**
	 * 事件解绑.
	 * @param event
	 * @param callback
	 */
	off(
		event: keyof HTMLElementEventMap,
		callback?: (e: HTMLElementEventMap[keyof HTMLElementEventMap]) => any
	): void {
		for (let i = 0, len = this.events.length; i < len; i++) {
			const cur = this.events[i];
			if (cur.event === event && cur.element === this.container) {
				Utils.off(cur.element, cur.event, cur.func);
				delete this.events[i];
			}
		}
	}

	/**
	 * 清空 stages.
	 * @return void
	 */
	protected reset(): void {
		for (const i in stages) {
			delete stages[i];
		}
	}

	/**
	 * 缩略图.
	 * @return void
	 */
	thumbnail(): void {
		const image = this.canvas.toDataURL(),
			element = document.getElementById(this.id);
		if (element) {
			element.style.backgroundSize = 'cover';
			element.style.backgroundPosition = 'no-repeat';
			element.style.backgroundImage = `url(${image})`;
			if (this.transparent) element.style.backgroundColor = 'transparent';
			else if (this.background) element.style.backgroundColor = this.background;
		}
	}

	/**
	 * 获取当前选中的工具名称.
	 * @return string
	 */
	getActiveTool(): string {
		return this.tool;
	}

	/**
	 * 手动设置选中的工具名称.
	 * @param tool
	 */
	setActiveTool(tool: string): void {
		if (!tool) return ;
		this.tool = tool.toLowerCase();
	}

	/**
	 * 设置选中笔刷工具的属性.
	 * @param attrs
	 */
	setActiveToolAttrs(attrs: MiBrushAttrsConfig): void {
		const tool = this.tools[this.tool] as Tools;
		if (tool) {
			for (const i in attrs) {
				if (Object.prototype.hasOwnProperty.call(attrs, i)) {
					(tool as any)[i] = (attrs as any)[i];
				}
			}
		}
	}

	/**
	 * 批量注册工具栏.
	 * @return void
	 */
	protected registerTools(): void {
		this.register(new Drag(this.canvas));
		this.register(new Selection(this.canvas));
		this.register(new Marker(this.canvas));
		this.register(new Laser(this.canvas));
		this.register(new Line(this.canvas));
		this.register(new Arrow(this.canvas));
		this.register(new Circle(this.canvas));
		this.register(new Rect(this.canvas));
		this.register(new Text(this.canvas));
		this.register(new Eraser(this.canvas));
		this.register(new Screenshot(this.canvas));
	}

	/**
	 * 获取 Stage 实例.
	 * @param index
	 */
	getStage(index: number | string): Stage {
		if (stages[index]) return stages[index];
		else {
			const keys = Object.keys(stages);
			return stages[keys[index as number]];
		}
	}

	/**
	 * 封装 Stage 实例属性.
	 * @return any
	 */
	getStages(): {
		id: string;
		background: string;
	}[] {
		const ids = Object.keys(stages),
			data: any[] = [];
		for (let i = 0, len = ids.length; i < len; i++) {
			const stage = stages[ids[i]];
			data.push({
				id: stage.id,
				background: stage.background
			});
		}
		return data;
	}

	/**
	 * 更新当前画布所有数据的坐标系原点.
	 * @param x
	 * @param y
	 * @param repaint 更新后是否重绘
	 */
	updateTransformOrigin(
		x: number,
		y: number,
		repaint = false
	): void {
		const keys = Object.keys(this.layers),
			len = keys.length;
		if (repaint) this.canvas.clear();
		for (let i = 0; i < len; i++) {
			const cur = this.layers[keys[i]] as Layer;
			for (let k = 0, l = cur.data.length; k < l; k++) {
				const active = cur.data[k] as MiLayerData;
				active.origin.x += x;
				active.origin.y += y;
				if (repaint && active.visible) {
					active.draw({
						rect: active.rect,
						move: active.move,
						scale: active.scale,
						rotate: active.rotate,
						origin: active.origin,
						ctx: this.canvas.getContext()
					});
				}
			}
		}
	}

	/**
	 * 更新 Canvas 背景色.
	 * @param color
	 */
	updateBackgroundColor(color: string | null): void {
		const canvas = this.canvas.getCanvas();
		if (color === null) {
			this.transparent = true;
			canvas.style.backgroundColor = 'white';
			canvas.style.backgroundImage = 'linear-gradient(45deg, #e8eaed 26%, transparent 25%, transparent 75%, #e8eaed 75%, #e8eaed), linear-gradient(45deg, #e8eaed 26%, transparent 25%, transparent 75%, #e8eaed 75%, #e8eaed)';
			canvas.style.backgroundPosition = '-6px -6px, 10px 10px';
			canvas.style.backgroundSize = '32px 32px';
			canvas.style.boxSizing = 'border-box';
		} else {
			this.transparent = false;
			this.background = color;
			canvas.style.background = color;
		}
		this.thumbnail();
	}

	/**
	 * 注册事件.
	 * @return void
	 */
	protected registerEvents(): void {
		if (window.PointerEvent) {
			this.pointerEvents();
		} else {
			this.mouseEvents();
			if ('ontouchstart' in window) this.touchEvents();
		}
	}

	/**
	 * Pointer 事件.
	 * @return void
	 */
	protected pointerEvents(): void {
		this.on('pointerdown');
		this.on('pointermove');
		this.on('pointerup');
		this.on('pointerenter');
		this.on('pointerleave');
	}

	/**
	 * Mouse 事件.
	 * @return void
	 */
	protected mouseEvents(): void {
		this.on('mousedown');
		this.on('mousemove');
		this.on('mouseup');
		this.on('mouseenter');
		this.on('mouseleave');
	}

	/**
	 * Touch 事件.
	 * @return void
	 */
	protected touchEvents(): void {
		this.on('touchstart');
		this.on('touchmove');
		this.on('touchend');
	}
}
