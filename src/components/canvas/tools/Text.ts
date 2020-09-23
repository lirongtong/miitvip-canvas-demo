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
import {MiBrushAttrs, MiBrushRepaintConfig, MiTools, MiToolsSyncData, Tools} from '@components/canvas/Tools';
import {Canvas} from '@components/canvas/Canvas';
import {Point} from '@components/canvas/Point';
import {MiRectConfig} from '@components/canvas/shapes/Rect';
import {MiLayerData} from '@components/canvas/Layer';
import {Utils} from '@components/canvas/Utils';

export interface MiTextConfig {
	size: number;                       // 文本大小
	content: string | null;             // 文本内容
	point: Point;                       // 起始坐标
	attrs: MiBrushAttrs;                // 公用属性
	rect: MiRectConfig;                 // 文本所占的方形区域
	index?: number | null;              // 编辑状态 - 待更新索引
	visible?: boolean;                  // 是否显示
	max: {                              // 内容最大宽高(用于自动换行/控制滚动条)
		width: number;
		height: number;
	}
}

export class Text extends Tools implements MiTools {
	name = 'text';
	divisor = 2;
	static data?: MiTextConfig;             // 文本属性
	static instance: Text;                  // 用于静态方法调用非静态方法.
	static wid = '';                        // wrapper id
	layerData?: MiLayerData;                // 选中的图层数据(文本)
	protected start!: Point;                // 输入的起始坐标点
	protected content = '';                 // 文本内容
	/** 最大宽高(用于自动换行/控制滚动条) */
	protected max: {width: number; height: number;} = {width: 0, height: 0};
	/** 文本内容所占的方形区域 */
	protected rect: MiRectConfig = {x: 0, y: 0, width: 0, height: 0};
	protected cid = '';                     // content id
	protected tid = '';                     // textarea id
	protected pid = '';                     // Pre id

	/**
	 * 构造.
	 * @param canvas
	 */
	constructor(canvas: Canvas) {
		super(canvas);
		Text.instance = this;
		Tools.instances[this.name] = this;
	}

	/**
	 * 重绘.
	 * @param args
	 */
	draw<A extends MiToolsSyncData[]>(...args: A): void {
		const data = args[0] as any,
			text = Utils.deepCopy(data.text) as MiTextConfig,
			attrs = text.attrs as MiBrushAttrs;
		Text.rendering({
			size: this.getThickness(this.divisor, attrs.thickness),
			content: text.content,
			point: new Point(text.point.x, text.point.y),
			attrs,
			rect: Utils.deepCopy(text.rect),
			max: Utils.deepCopy(text.max)
		}, false, this, data.config);
	}

	/**
	 * 绘制.
	 * @param data
	 * @param config
	 * @param ctx
	 */
	protected drawText(
		data: MiTextConfig,
		config?: MiBrushRepaintConfig,
		ctx?: CanvasRenderingContext2D
	): void {
		const content = data.content;
		if (content) {
			ctx = ctx ?? this.getCurrentContext();
			const attrs = data.attrs,
				size = this.getThickness(this.divisor, attrs.thickness),
				breakContent = content.split('\n'),
				scale = config && config.scale;
			ctx.save();
			/** 设置属性 */
			ctx.font = `${size}px Helvetica Neue, Helvetica, PingFang SC, Hiragino Sans GB, Microsoft YaHei, 微软雅黑, Arial, sans-serif`;
			ctx.textBaseline = 'top';
			ctx.fillStyle = Utils.colorHexToRgba(attrs.color, attrs.opacity);
			/** 细微的偏移量调整 */
			let offset = size >= 25 ? (size >= 34 ? 4 : 5) : 6,
				x = data.point.x - 2,
				y = data.point.y - offset;
			for (let i = 0, len = breakContent.length; i < len; i++) {
				const charContent = breakContent[i].split('');
				let lineFeedStr = '', spacing = 0;
				for (let k = 0, length = charContent.length; k < length; k++) {
					const letter = charContent[k],
						letterWidth = ctx.measureText(letter).width;
					lineFeedStr += letter;
					spacing++;
					/** 缩放后, 且在设定最大宽高时, 分别 +21/-82 了 */
					const lineFeedStrWidth = ctx.measureText(lineFeedStr).width * (scale ?? 1) + (spacing * 2 * (scale ?? 1)) + 21;
					if (k > 0 && lineFeedStrWidth > (data.max.width)) {
						/** 自动换行绘制 */
						x = data.point.x - 2;
						y += size + 10;
						lineFeedStr = letter;
						spacing = 0;
						ctx.fillText(letter, x, y);
						x += letterWidth + 2;
					} else {
						/** 正常绘制 */
						ctx.fillText(letter, x, y);
						x += letterWidth + 2;
					}
				}
				/** 手动换行, 更新坐标 */
				x = data.point.x - 2;
				y += size + 10;
			}
			ctx.restore();
		}
	}

	/**
	 * 渲染.
	 * @param data
	 * @param external
	 * @param instance
	 * @param config
	 * @param ctx
	 */
	static rendering(
		data: MiTextConfig,
		external: boolean,
		instance: Text,
		config?: MiBrushRepaintConfig,
		ctx?: CanvasRenderingContext2D
	): void {
		const content = data.content ?? null;
		if (content) {
			ctx = ctx ?? config?.ctx ?? Text.prototype.getCurrentContext();
			const tempData = Utils.deepCopy(data),
				rectangle = tempData.rect as MiRectConfig;
			ctx.save();
			if (config) {
				/** 无限画布 */
				if (config.origin) ctx.translate(config.origin.x, config.origin.y);
				/** 移动 */
				if (config.move) {
					const isMoving = config.move.x !== 0 || config.move.y !== 0;
					if (isMoving) {
						tempData.start.x += config.move.x;
						tempData.start.y += config.move.y;
						rectangle.x += config.move.x;
						rectangle.y += config.move.y;
					}
				}
			}
			if (config?.selection) instance.drawChoiceRect(ctx, rectangle);
			else instance.drawText(tempData, config, ctx);
			ctx.restore();
			if (external) instance.saveData();
		}
	}

	/**
	 * 文本域.
	 *
	 * 1. 先清除上一次生成的文本域, 如果存在的话.
	 * 2. 创建 textarea / pre / span 等标签内容.
	 * 3. textarea 宽高自适应的实现.
	 * 4. 编辑状态, 内容初始化.
	 *
	 * @param point
	 */
	protected createWrapper(point: Point): void {
		/** 清除上一次生成的文本域 */
		const previous = document.getElementById(Text.wid);
		if (previous) previous.remove();
		/** 分别是 wrapper id / pre id / content id / textarea id */
		Text.wid = Utils.uid();
		this.pid = Utils.uid();
		this.cid = Utils.uid();
		this.tid = Utils.uid();
		/** 创建 div, 绝对定位 */
		const wrapper = document.createElement('div'),
			scroll = this.createScroll(point);
		let left = point.x - 4,
			top = point.y - 12;
		if (this.layerData) {
			const scale = this.layerData.scale;
			if (scale) {
				/**
				 * 原方形比内容区域的宽高各多出10, 缩放后这部分也需要变更.
				 * 原内容区域左右有 padding 2px, 这部分也不能忘(上下没有).
				 */
				left += 6 * (scale - 1);
				top += scale - 1;
			}
		}
		/** 偏移量 */
		const offset = this.canvas.getCanvas().getBoundingClientRect();
		left += offset.left;
		top += offset.top;
		/** 移动 */
		if (this.layerData) {
			const move = this.layerData.move;
			left += move.x;
			top += move.y;
		}
		wrapper.id = Text.wid;
		wrapper.className = 'mi-canvas-text-wrapper';
		wrapper.style.left = `${left}px`;
		wrapper.style.top = `${top}px`;
		wrapper.appendChild(scroll);
		document.body.append(wrapper);
		/** textarea 延迟聚焦 */
		setTimeout(() => {
			const textarea = document.getElementById(this.tid);
			if (textarea) textarea.focus();
			this.adaptTextarea();
		}, 50);
	}

	/**
	 * 包装文本域的元素.
	 *
	 * 1. 创建 pre 元素, 用于自适应宽高.
	 * 2. 创建 textarea 元素, 用于文本输入.
	 *
	 * @param point
	 */
	protected createScroll(point: Point): HTMLDivElement {
		const scroll = document.createElement('div'),
			pre = this.createPre(),
			textarea = this.createTextarea(point);
		scroll.className = 'mi-canvas-text-scroll';
		scroll.appendChild(pre);
		scroll.appendChild(textarea);
		return scroll;
	}

	/**
	 * Pre 元素, 用于自适应 textarea 文本输入的宽高.
	 * 另需加入 br 换行, 避免换行后高度不一致.
	 * @return {HTMLPreElement}
	 */
	protected createPre(): HTMLPreElement {
		const pre = document.createElement('pre'),
			content = document.createElement('span'),
			br = document.createElement('br');
		pre.id = this.pid;
		content.id = this.cid;
		pre.appendChild(content);
		pre.appendChild(br);
		this.setContentSize(pre);
		return pre;
	}

	/**
	 * 创建 textarea 文本输入元素.
	 *
	 * 1. 根据定位的坐标信息, 计算文本域的最大宽高, 方便自动换行及控制上下滚动条.
	 * 2. 选中有内容的文本时, 初始化问题.
	 *
	 * @param point
	 */
	protected createTextarea(point: Point): HTMLTextAreaElement {
		const textarea = document.createElement('textarea');
		textarea.id = this.tid;
		this.setContentColor(textarea);
		this.setContentSize(textarea);
		this.setContentMaxArea(textarea, point);
		return textarea;
	}

	/**
	 * 文本宽高根据内容自适应.
	 * @return void
	 */
	protected adaptTextarea(): void {
		const area = document.getElementById(this.tid) as HTMLTextAreaElement,
			content = document.getElementById(this.cid);
		if (area && content) {
			/** 输入 */
			Utils.on(area, 'input', () => {
				content.textContent = area.value;
				this.content = area.value;
				this.setContentRect(content);
				this.setData(area.value);
			});
			/** 删除 */
			Utils.on(area, 'keyup', (evt) => {
				const key = evt as KeyboardEvent,
					code = key.keyCode;
				if (code === 8 || code === 46) {
					const str = area.value.trim();
					content.textContent = str;
					this.setContentRect(content);
					this.setData(str);
				}
			});
			/** 复制粘贴 */
			Utils.on(area, 'cut', () => {
				content.textContent = area.value;
				this.setContentRect(content);
				this.setData(area.value);
			});
			/** 初始化 */
			if (this.layerData) {
				const text = this.getTextContent() as MiTextConfig;
				content.textContent = text.content;
				area.value = (text.content as string).toString();
			} else content.textContent = area.value;
		}
	}

	/**
	 * 设置内容宽高.
	 * @param content
	 */
	protected setContentRect(content?: HTMLSpanElement): void {
		content = content ?? document.getElementById(this.cid) as HTMLSpanElement;
		this.rect.width = Math.ceil(content.offsetWidth) + 10;
		this.rect.height = Math.ceil(content.offsetHeight) + 10;
	}

	/**
	 * 设置内容最大区域(用于自动换行, 滚动条显示等控制).
	 * @param textarea
	 * @param point
	 */
	protected setContentMaxArea(
		textarea: HTMLTextAreaElement,
		point: Point
	): void {
		const max = {
			width: this.canvas.width - point.x + 21,
			height: this.canvas.height - point.y - 82
		};
		textarea.style.maxWidth = `${max.width}px`;
		textarea.style.maxHeight = `${max.height}px`;
		this.max = max;
	}

	/**
	 * 设置文本字体大小/间距.
	 * @param elem 元素
	 * @param size 字体大小
	 * @param setRect 设置完后是否更新矩形大小
	 */
	protected setContentSize(
		elem: HTMLElement,
		size?: number,
		setRect?: boolean
	): void {
		const text = this.getTextContent();
		let nSize = size ?? this.getThickness(this.divisor);
		if (text && !size) nSize = text.size;
		elem.style.fontSize = `${nSize}px`;
		elem.style.lineHeight = `${nSize + 10}px`;
		elem.style.letterSpacing = '2px';
		if (setRect) this.setContentRect(elem);
	}

	/**
	 * 字体变更后的操作.
	 * @param thickness
	 */
	setContentSizeAfterChange(thickness: number): void {
		if (Text.data && Text.data.attrs.thickness === thickness) return ;
		const content = document.getElementById(this.cid);
		if (content) {
			const textarea = document.getElementById(this.tid),
				size = this.getThickness(this.divisor, thickness);
			if (textarea) {
				if (Text.data) Text.data.attrs.thickness = thickness;
				this.setContentSize(textarea, size);
			}
			const pre = document.getElementById(this.pid);
			if (pre) {
				this.setContentSize(pre, size);
				this.setContentRect(content);
			}
		}
	}

	/**
	 * 设置文本域的颜色/透明度.
	 * @param elem
	 * @param color
	 * @param opacity
	 */
	protected setContentColor(
		elem: HTMLElement,
		color?: string,
		opacity?: number | string
	): void {
		const text = this.getTextContent();
		let nColor = color ?? Tools.color,
			nOpacity = opacity !== undefined  && parseInt(opacity as string) >= 0
				? opacity.toString()
				: Tools.opacity.toString();
		if (text && !color) nColor = text.attrs.color;
		if (text && opacity === undefined) nOpacity = text.attrs.opacity.toString();
		elem.style.opacity = nOpacity;
		elem.style.color = nColor;
	}

	/**
	 * 颜色/透明度变更后的操作.
	 * @param color
	 * @param opacity
	 */
	setContentColorAfterChange(
		color?: string,
		opacity?: number
	): void {
		const content = document.getElementById(this.cid);
		if (content) {
			const textarea = document.getElementById(this.tid);
			if (textarea) {
				if (Text.data && color) Text.data.attrs.color = color;
				if (Text.data && opacity !== undefined) Text.data.attrs.opacity = opacity;
				this.setContentColor(textarea, color, opacity);
			}
		}
	}

	/**
	 * 操作记录.
	 * @param index
	 * @param attrs
	 * @param rect
	 * @param oAttrs
	 * @param oRect
	 */
	protected saveTrace(
		index?: number,
		attrs?: MiBrushAttrs,
		rect?: MiRectConfig,
		oAttrs?: MiBrushAttrs,
		oRect?: MiRectConfig
	): void {
		if (index !== undefined) {
			const params = {
				operation: 'edit',
				index,
				active: {},
				old: {}
			} as any;
			if (attrs) params.active.attrs = attrs;
			if (rect) params.active.rect = rect;
			if (oAttrs) params.old.attrs = oAttrs;
			if (oRect) params.old.rect = oRect;
			Tools.setTraces(params);
		} else Tools.setTraces();
	}

	/**
	 * 设置文本数据, 用于绘制.
	 * @param content
	 */
	protected setData(content: string | null): void {
		if (this.layerData) {
			/** 编辑状态 */
			const data = Text.data as MiTextConfig;
			data.rect = {...this.rect};
			data.content = content ? content.trim() : '';
		} else {
			Text.data = Utils.deepCopy({
				size: this.getThickness(this.divisor),
				content: content ? content.trim() : '',
				point: this.start,
				attrs: {...this.getCtxAttrs()},
				rect: this.rect,
				max: this.max
			});
		}
	};

	/**
	 * 判断是否编辑中.
	 * @param data
	 * @param layerData
	 */
	protected isEditing(
		data?: MiTextConfig,
		layerData?: MiLayerData
	): boolean {
		let result = false;
		data = (data ?? Text.data) as MiTextConfig;
		layerData = layerData ?? this.layerData;
		if (layerData) {
			const text = layerData.text as MiTextConfig;
			if (
				text.content !== data.content ||
				text.attrs.color !== data.attrs.color ||
				text.attrs.opacity !== data.attrs.opacity ||
				text.attrs.thickness !== data.attrs.thickness
			) result = true;
		}
		return result;
	}

	/**
	 * 保存数据(区分编辑状态).
	 * @return void
	 */
	protected saveData(
		data?: MiTextConfig,
		layerData?: MiLayerData,
		index?: number | null
	): void {
		data = data ?? Utils.deepCopy(Text.data) as MiTextConfig;
		layerData = layerData ?? this.layerData;
		index = index !== undefined ? index : Tools.getLayer().index;
		if (
			layerData &&
			index !== undefined &&
			index !== null
		) {
			/** 编辑 */
			if (this.isEditing(data, layerData)) {
				const text = Utils.deepCopy(layerData.text) as MiTextConfig;
				this.saveTrace(
					index, data.attrs, data.rect,
					text.attrs, text.rect
				);
				layerData.rect = {...data.rect};
				layerData.text = data;
				layerData.draw = (config) => {
					Text.rendering(
						data as MiTextConfig,
						false,
						this,
						config
					)
				};
			}
		} else {
			/** 常规 */
			const params = {
				...this.getDefaultSyncData(),
				rect: {...data.rect},
				text: data,
				attrs: {...data.attrs},
				tool: this.name
			} as MiToolsSyncData;
			this.saveLayerData(params);
			this.saveTrace();
		}
		Text.data = undefined;
		this.layerData = undefined;
		Tools.getLayer().index = null;
	}

	/**
	 * 获取文本内容.
	 * @return MiTextConfig | null
	 */
	protected getTextContent(): MiTextConfig | null {
		let text: MiTextConfig | null = null;
		if (this.layerData) text = this.layerData.text as MiTextConfig;
		return text;
	}

	/**
	 * 判断是否选中已存在的文本(选中则进入编辑状态).
	 * @param point
	 */
	protected isPointInTextarea(point: Point): boolean {
		const data = Tools.getLayer().data,
			len = data.length;
		let isIn = false;
		for (let i = len - 1; i >= 0; i--) {
			const cur = data[i];
			if (
				cur.visible &&
				cur.tool === 'text' &&
				cur.rect
			) {
				if (this.isPointInRect(
					point,
					cur.rect,
					cur.move,
					cur.scale,
					cur.origin
				)) {
					isIn = true;
					this.layerData = cur;
					Tools.getLayer().index = i;
					break;
				}
			}
		}
		return isIn;
	}

	/**
	 * 准备绘制.
	 *
	 * 1. 点击屏幕, 准备输入文字.
	 * 2. 先判断 "上一步" 是否为文本操作, 若有内容, 需要先执行保存操作.
	 * 3. 再判断当前点击位置是否选中了已存在的文本内容.
	 * 4. 选中, 则重绘整个 Canvas 内容, 除了当前选中的文本内容.
	 *    并初始化内容, 实现 "再次编辑" 的文本域状态.
	 * 5. 若未选中, 手动生成文本域, 编辑内容, 渲染至 Canvas.
	 * 6. 封装数据, 保存文本内容.
	 *
	 * @param event
	 */
	protected drawBegin(event: MouseEvent | PointerEvent | Touch): void {
		let point = this.createPoint(event.clientX, event.clientY);
		if (Text.data) {
			if (Text.data.content) {
				/**
				 * 上一次(未渲染)
				 * 离开文本工具 / 文本输入的起始位置变更
				 * 需先保存上次文本域内的文本内容(绘制)
				 * 进而清理 Text.data, 再保存数据.
				 */
				Text.rendering(
					Text.data,
					false,
					this,
					this.layerData ? {
						scale: this.layerData.scale,
						move: {...this.layerData.move},
						origin: {...this.layerData.origin},
						rect: Utils.deepCopy(this.layerData.rect)
					} : undefined
				);
				this.saveData();
			} else {
				/** 编辑状态下, 清除保存的数据 */
				if (this.layerData) Tools.getLayer().clear(Tools.getLayer().index as number);
				/** 恢复 */
				Text.data = undefined;
				this.layerData = undefined;
				Tools.getLayer().index = null;
			}
		}
		if (this.isPointInTextarea(point)) {
			/** 重绘(不包含当前选中) */
			Tools.getStage().draw();
			/** 初始化选中内容 */
			if (this.layerData) {
				/** 封装内容 */
				const data = Utils.deepCopy(this.layerData.text) as MiTextConfig;
				/** 设置 rect, 避免保存时为初始状态值 */
				this.rect = data.rect;
				/** 编辑的文本索引 */
				data.index = Tools.getLayer().index;
				const start = new Point(data.point.x, data.point.y);
				this.start = start;
				point = start;
				Text.data = data;
			}
		} else {
			/**
			 * 1. 首次.
			 * 2. 上一次操作非 "编辑" 状态.
			 * 3. 未选中已存在的文本内容.
			 */
			this.start = point;
			this.rect.x = point.x - 8;
			this.rect.y = point.y - 13;
		}
		this.createWrapper(point);
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
