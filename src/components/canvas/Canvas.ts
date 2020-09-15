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
import {Utils} from '@components/canvas/Utils';
import {Tools} from '@components/canvas/Tools';
import {Stage} from '@components/canvas/Stage';

interface MiCanvasConfig {
	width?: number;
	height?: number;
	ratio?: number;
	background?: string;
	index?: number | string;
}

class MiCanvas {
	id: string;
	canvas: HTMLCanvasElement;
	ctx: CanvasRenderingContext2D;
	ratio = 1;
	width = 0;
	height = 0;

	/**
	 * 构造.
	 * @param config
	 */
	constructor(config: MiCanvasConfig) {
		this.id = Utils.uid();
		this.canvas = Utils.createCanvasElement();
		this.ctx = this.canvas.getContext('2d') as CanvasRenderingContext2D;
		this.ratio = config.ratio ?? 1;
		this.canvas.id = this.id;
		this.canvas.style.padding = '0';
		this.canvas.style.margin = '0';
		this.canvas.style.border = '0';
		this.canvas.style.backgroundColor = config.background ?? 'transparent';
		this.canvas.style.position = 'absolute';
		this.canvas.style.top = '0';
		this.canvas.style.left = '0';
		this.canvas.style.zIndex = config.index as string;
	}

	/**
	 * 创建离屏渲染画布.
	 * @param container
	 */
	create(container?: HTMLDivElement): Canvas {
		const stage = Tools.getStage();
		container = container ?? (stage ? stage.canvas : this).getCanvas().parentNode as HTMLDivElement;
		const nStage = new Stage({
			container,
			buffer: true
		});
		nStage.canvas.getCanvas().style.backgroundColor = 'transparent';
		return nStage.canvas;
	}

	/**
	 * 移除.
	 * @return void
	 */
	remove(): void {
		const element = this.getCanvas().parentNode as HTMLDivElement;
		if (element) element.removeChild(this.getCanvas());
	}

	/**
	 * 获取画布元素.
	 * @return HTMLCanvasElement
	 */
	getCanvas(): HTMLCanvasElement {
		return this.canvas;
	}

	/**
	 * 获取画布上下文.
	 * @return CanvasRenderingContext2D
	 */
	getContext(): CanvasRenderingContext2D {
		return this.ctx;
	}

	/**
	 * 设置宽高.
	 * @param width
	 * @param height
	 */
	setSize(
		width: number,
		height: number
	): void {
		this.setWidth(width);
		this.setHeight(height);
	}

	/**
	 * 获取宽度.
	 * @return number
	 */
	getWidth(): number {
		return this.width;
	}

	/**
	 * 设置宽度.
	 * @param width
	 */
	protected setWidth(width: number): void {
		this.width = this.canvas.width = width * this.ratio;
		this.canvas.style.width = `${width}px`;
		this.ctx.scale(this.ratio, this.ratio);
	}

	/**
	 * 获取高度.
	 * @return number
	 */
	getHeight(): number {
		return this.height;
	}

	/**
	 * 设置高度.
	 * @param height
	 */
	protected setHeight(height: number): void {
		this.height = this.canvas.height = height * this.ratio;
		this.canvas.style.height = `${height}px`;
		this.ctx.scale(this.ratio, this.ratio);
	}

	/**
	 * 获取图片DataURL.
	 * @param type
	 * @param quality
	 */
	toDataURL(type?: string, quality?: any): string {
		try {
			return this.canvas.toDataURL(type, quality);
		} catch (e) {
			try {
				return this.canvas.toDataURL();
			} catch (err) {
				console.error(err.message);
				return '';
			}
		}
	}

	/**
	 * 清除.
	 * @param bounds
	 */
	clear(bounds?: any): void {
		if (bounds) {
			this.ctx.clearRect(
				bounds.x || 0,
				bounds.y || 0,
				bounds.width || 0,
				bounds.height || 0
			)
		} else {
			this.ctx.clearRect(
				0,
				0,
				this.getWidth() / this.ratio,
				this.getHeight() / this.ratio
			)
		}
	}
}

export class Canvas extends MiCanvas {
	constructor(config: MiCanvasConfig = {
		width: 0,
		height: 0
	}) {
		config.index = config.index ?? 578;
		super(config);
		this.setSize(
			config.width as number,
			config.height as number
		);
	}
}
