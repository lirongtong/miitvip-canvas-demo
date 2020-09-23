/*
 * +-------------------------------------------+
 * |                  MIITVIP                  |
 * +-------------------------------------------+
 * | Copyright (c) 2020 makeit.vip             |
 * +-------------------------------------------+
 * | Author: makeit <lirongtong@hotmail.com>   |
 * | Homepage: https://www.makeit.vip          |
 * | Github: https://git.makeit.vip            |
 * | Date: 2020-9-9 13:24                      |
 * +-------------------------------------------+
 */
import {Canvas} from '@components/canvas/Canvas';
import {Arc} from '@components/canvas/shapes/Arc';
import {Tools} from '@components/canvas/Tools';
import laser from '@images/laser.png';

export interface MiCursorConfig {
	container: string | HTMLDivElement;     // 所属容器
	radius?: number;                        // 光标半径(针对自定义圆形光标)
	type?: string;                          // 光标类型
	color?: string;                         // 光标颜色(同上)
	line?: number;                          // 光标边框粗细(同上)
	stroke?: string;                        // 光标边框颜色(同上)
}

export class Cursor {
	container: HTMLDivElement;
	type = 'default';
	radius: number;
	line?: number = 1;
	color?: string;
	stroke?: string;

	/**
	 * 构造.
	 * @param config
	 */
	constructor(config: MiCursorConfig) {
		this.container = ((
			config.container instanceof HTMLDivElement
				? config.container
				: document.getElementById(config.container)
		) as HTMLDivElement);
		this.color = config.color;
		this.radius = config.radius || 0;
		this.stroke = config.stroke;
		this.line = config.line;
	}

	/**
	 * 创建光标.
	 * @return void
	 */
	protected create(): void {
		let cursor;
		switch (this.type) {
			case 'move':
				cursor = `move`;
				break;
			case 'resize':
				cursor = 'se-resize';
				break;
			case 'w-resize':
				cursor = 'w-resize';
				break;
			case 'n-resize':
				cursor = 'n-resize';
				break;
			case 'sw-resize':
				cursor = 'sw-resize';
				break;
			case 'nw-resize':
				cursor = 'nw-resize';
				break;
			case 'ne-resize':
				cursor = 'ne-resize';
				break;
			case 'se-resize':
				cursor = 'se-resize';
				break;
			case 'copy':
				cursor = 'copy';
				break;
			case 'crop':
				cursor = 'crosshair';
				break;
			case 'rotate':
				cursor = 'crosshair';
				break;
			case 'text':
				cursor = 'text';
				break;
			case 'laser':
				cursor = `url("${laser}") 16 16, auto`;
				break;
			case 'circle':
				const width = (this.radius as number) * 2,
					height = (this.radius as number) * 2,
					canvas = new Canvas({
						width,
						height
					}),
					ctx = canvas.getContext();
				canvas.clear();
				const arc = new Arc({
					x: this.radius,
					y: this.radius,
					radius: this.radius,
					strokeWidth: this.line || 1,
					strokeStyle: this.stroke ?? 'rgba(0, 0, 0, .5)',
					fillStyle: this.color ?? 'rgb(0, 0, 0)'
				});
				arc.draw(ctx);
				const url = canvas.toDataURL(),
					size = Math.floor(canvas.width / 2);
				cursor = `url(${url}) ${size} ${size}, auto`;
				break;
			default:
				cursor = 'default';
				break;
		}
		if (this.container && cursor) this.container.style.cursor = cursor;
	}

	/**
	 * 更新光标样式.
	 * @param tool
	 * @param config
	 */
	update(
		tool: string,
		config?: {
			stroke?: string;
			line?: number;
			thickness?: number;
			color?: string;
			divisor?: number;
			solid?: boolean;
		}
	): void {
		const brush = Tools.getStage().getActiveTool();
		tool = tool === 'brush' ? brush : tool;
		switch (tool) {
			/** 拖拽 */
			case 'drag':
				this.type = 'move';
				break;

			/** 选择 */
			case 'selection':
				this.type = 'default';
				break;

			/** 文本 */
			case 'text':
				this.type = 'text';
				break;

			/** 橡皮擦 */
			case 'eraser':
				this.type = 'eraser';
				break;

			/** 截屏 */
			case 'screenshot':
				this.type = 'crop';
				break;

			/** 激光笔 */
			case 'laser':
				this.type = `laser`;
				break;

			/** 圆点 */
			default:
				this.type = 'circle';
				let radius = Math.ceil((config?.thickness ?? Tools.thickness) / (config?.divisor ?? 8));
				switch (tool) {
					/** 直线 */
					case 'line':
						radius = Math.ceil((config?.thickness ?? Tools.thickness) / (config?.divisor ?? 20));
						break;

					/** 矩形 / 圆形 */
					case 'circle':
					case 'rect':
						if (config?.solid) radius = 5;
						else radius = Math.ceil((config?.thickness ?? Tools.thickness) / (config?.divisor ?? 10));
						break;

					/** 箭头 */
					case 'arrow':
						radius = 5;
						break;
				}
				this.radius = radius;
				break;
		}
		if (config?.color) this.color = config.color;
		if (config?.stroke) this.stroke = config.stroke;
		if (config?.line) this.line = config.line;
		this.create();
	}
}
