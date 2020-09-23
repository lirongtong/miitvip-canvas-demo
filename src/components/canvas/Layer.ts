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
import {Utils} from '@components/canvas/Utils';
import {MiBrushRepaintConfig, Tools} from '@components/canvas/Tools';
import {Stage} from '@components/canvas/Stage';
import {MiPointConfig} from '@components/canvas/Point';
import {MiRectConfig} from '@components/canvas/shapes/Rect';
import {MiTextConfig} from '@components/canvas/tools/Text';

export abstract class MiLayer {
	data: MiLayerData[] = [];
	abstract draw(): void;
	abstract clear(...args: any): void;
}

/** 图层数据 */
export interface MiLayerData {
	tool: string;                                       // 工具
	move: MiPointConfig;                                // 移动数据
	rotate: number;                                     // 旋转角度
	scale: number;                                      // 缩放比例
	origin: MiPointConfig;                              // 坐标系原点
	visible: boolean;                                   // 是否显示(橡皮擦擦除后为false)
	rect?: MiRectConfig;                                // 方形属性(主要用于判断内容选中)
	text?: MiTextConfig;                                // 文本内容属性
	draw: (config?: MiBrushRepaintConfig) => void;      // 具体工具类中实现
}

export class Layer extends MiLayer {
	id: string;                         // ID
	idx: number;                        // 图层序号
	index: number | null = null;        // 当前选中的数据索引
	hidden: boolean;                    // 是否隐藏
	thumb = '';                         // 图层缩略图(避免画布切换时, 需要重新生成)
	selected = -1;                      // 选中索引
	eraser: {                           // 橡皮擦选中内容
		index: number;
		selection: boolean;
	} = {
		index: -1,
		selection: false
	};

	/**
	 * 构造.
	 * @param idx
	 */
	constructor(idx?: number) {
		super();
		this.id = Utils.uid();
		const stage = Tools.getStage(),
			layers = stage.layers,
			keys = Object.keys(layers);
		const last = layers[keys[keys.length - 1]],
			index = last ? last.idx + 1 : 1;
		this.idx = idx ?? index;
		this.hidden = false;
	}

	/**
	 * 绘制(隐藏的图层/选中的图形不重绘).
	 * @param ctx
	 * @param data
	 */
	draw(
		ctx?: CanvasRenderingContext2D,
		data?: MiLayerData[]
	): void {
		if (data && data.length > 0) {
			for (let i = 0, len = data.length; i < len; i++) {
				const cur = data[i];
				cur.draw({
					rect: cur.rect,
					scale: cur.scale ?? 1,
					rotate: cur.rotate ?? 0,
					move: cur.move,
					origin: cur.origin,
					ctx
				});
			}
		} else {
			if (!this.hidden) {
				const selection: MiBrushRepaintConfig = {};
				for (let i = 0, len = this.data.length; i < len; i++) {
					const cur = this.data[i];
					if (cur.visible) {
						const config = {
							rect: cur.rect,
							scale: cur.scale ?? 1,
							rotate: cur.rotate ?? 0,
							move: cur.move,
							origin: cur.origin,
							ctx
						};
						if (
							this.index !== null &&
							i === this.index
						) {
							this.selected = i;
							if (cur.tool !== 'text') cur.draw(config);
							selection.selection = true;
						} else cur.draw(config);
					}
				}
				/** 选中框 - 遍历完成后绘制 */
				if (this.selected !== -1) {
					const data = this.data[this.selected];
					data.draw(selection);
					this.selected = -1;
				}
				/** 橡皮擦选中 */
				if (this.eraser.selection) {
					const active = this.data[this.eraser.index] as any,
						tool = Tools.getInstances()[active.tool];
					if (tool) tool.drawEraserRect(
						active.rect,
						active.move,
						active.scale,
						active.origin
					);
				}
			}
		}
	}

	/**
	 * 清除(整个图层/指定图层内某条数据).
	 * @param index
	 */
	clear(index?: number): void {
		if (index !== undefined) {
			/** 清除图层内的单条数据 */
			if (this.data && this.data[index]) {
				this.data[index].visible = false;
				Tools.setTraces({
					operation: 'eraser',
					index
				});
			}
		} else {
			/** 清除整个图层数据 */
			const indexes: number[] = [];
			for (let i = 0, len = this.data.length; i < len; i++) {
				if (this.data[i].visible) {
					this.data[i].visible = false;
					indexes.push(i);
				}
			}
			if (indexes.length > 0) {
				Tools.setTraces({
					operation: 'clean',
					indexes
				});
			}
		}
		/** 重绘 */
		this.eraser.index = -1;
		this.eraser.selection = false;
		Tools.getStage().draw(true);
	}

	/**
	 * 缩略图.
	 * @param data
	 * @param width
	 * @param height
	 */
	thumbnail(
		data?: MiLayerData[],
		width?: number,
		height?: number
	): void {
		const elem = document.getElementById(this.id);
		if (elem) {
			const stage = Tools.getStage(),
				canvas = Utils.createCanvasElement();
			width = width ?? stage.canvas.width;
			height = height ?? stage.canvas.height;
			canvas.width = width;
			canvas.height = height;
			const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
			this.draw(ctx, data);
			const image = canvas.toDataURL();
			elem.style.backgroundSize = 'cover';
			elem.style.backgroundPosition = 'no-repeat';
			elem.style.backgroundImage = `url(${image})`;
			this.thumb = image;
			canvas.remove();
		}
	}

	/**
	 * 封装 Layer 实例属性.
	 * @param stage
	 */
	getLayers(stage?: Stage): {
		id: string;
		idx: number;
		index: number;
		hidden: boolean;
		thumb: string;
	}[] {
		stage = stage ?? Tools.getStage();
		const ids = Object.keys(stage.layers),
			data: any[] = [];
		for (let i = 0, len = ids.length; i < len; i++) {
			const layer = stage.layers[ids[i]];
			data.push({
				id: layer.id,
				idx: layer.idx,
				index: layer.index,
				hidden: layer.hidden,
				thumb: layer.thumb
			});
		}
		return data;
	}
}
