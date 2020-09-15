/*
 * +-------------------------------------------+
 * |                  MIITVIP                  |
 * +-------------------------------------------+
 * | Copyright (c) 2020 makeit.vip             |
 * +-------------------------------------------+
 * | Author: makeit <lirongtong@hotmail.com>   |
 * | Homepage: https://www.makeit.vip          |
 * | Github: https://git.makeit.vip            |
 * | Date: 2020-9-15 11:41                     |
 * +-------------------------------------------+
 */
import {MiTools, Tools} from '@components/canvas/Tools';
import {Canvas} from '@components/canvas/Canvas';
import {Point} from '@components/canvas/Point';
import {MiRectConfig, MiRectPointConfig} from '@components/canvas/shapes/Rect';

export class Screenshot extends Tools implements MiTools {
	name = 'screenshot';
	type = 'area';
	start = new Point(0, 0);
	rect: MiRectConfig = {x: 0, y: 0, width: 0, height: 0};
	protected static instance: Screenshot;

	/**
	 * 构造.
	 * @param canvas
	 */
	constructor(canvas: Canvas) {
		super(canvas);
		Screenshot.instance = this;
		Tools.instances[this.name] = this;
	}

	/**
	 * 截图.
	 * @return void
	 */
	draw(): void {
		/** 过小的区域不下载 */
		if (this.type === 'area' && this.rect.width < 10 && this.rect.height < 10) return ;
		/** 开始截图 */
		const time = Date.parse(new Date().toString()),
			file = `mi-meeting-screenshot-${time}.webp`,
			type = 'image/webp',
			clipCanvas = document.createElement('canvas'),
			screenCanvas = document.createElement('canvas'),
			clipCtx = clipCanvas.getContext('2d') as CanvasRenderingContext2D,
			screenCtx = screenCanvas.getContext('2d') as CanvasRenderingContext2D;
		let dataURL = '',
			width = this.canvas.width,
			height = this.canvas.height,
			canvas!: HTMLCanvasElement,
			ctx!: CanvasRenderingContext2D,
			image!: ImageData;
		if (this.type === 'area') {
			width = this.rect.width;
			height = this.rect.height;
			canvas = clipCanvas;
			ctx = clipCtx;
			image = this.ctx.getImageData(this.rect.x, this.rect.y, this.rect.width, this.rect.height);
			/** rect 复位 */
			this.rect = {x: 0, y: 0, width: 0, height: 0};
		} else if (this.type === 'screen') {
			canvas = screenCanvas;
			ctx = screenCtx;
			image = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
		}
		canvas.width = width;
		canvas.height = height;
		ctx.putImageData(image, 0, 0, 0, 0, width, height);
		if (!Tools.stage.transparent) {
			/** 背景色 */
			ctx.globalCompositeOperation = 'destination-over';
			ctx.fillStyle = Tools.stage.background;
			ctx.fillRect(0, 0, width, height);
		}
		dataURL = canvas.toDataURL(type, 1);
		this.download(file, dataURL);
	}

	/**
	 * 绘制截图区域.
	 * @param points
	 * @param ctx
	 */
	protected drawCropArea(
		points: MiRectPointConfig,
		ctx?: CanvasRenderingContext2D
	): void {
		ctx = ctx ?? this.getBufferContext();
		ctx.beginPath();
		ctx.moveTo(points.lt.x, points.lt.y);
		ctx.lineTo(points.rt.x, points.rt.y);
		ctx.lineTo(points.rb.x, points.rb.y);
		ctx.lineTo(points.lb.x, points.lb.y);
		ctx.closePath();
		ctx.stroke();
	}

	/**
	 * 截图(外部).
	 * @return void
	 */
	static screenshot(): void {
		Screenshot.instance.draw();
	}

	/**
	 * 保存至本地.
	 * @param file
	 * @param dataURL
	 */
	protected download(
		file: string,
		dataURL: string
	): void {
		const link = document.createElement('a'),
			blob = this.image2Blob(dataURL),
			evt = document.createEvent('MouseEvents');
		link.download = file;
		link.style.display = 'none';
		link.href = URL.createObjectURL(blob);
		document.body.appendChild(link);
		link.click();
		link.remove();
	}

	/**
	 * 图片数据转Blob数据.
	 * @param dataURL
	 */
	protected image2Blob(dataURL: string): Blob {
		const parts = dataURL.split(';base64,'),
			type = parts[0].split(':')[1],
			raw = window.atob(parts[1]),
			length = raw.length,
			uInt8Array = new Uint8Array(length);
		for (let i = 0; i < length; i++) {
			uInt8Array[i] = raw.charCodeAt(i);
		}
		return new Blob([uInt8Array], {type});
	}

	/**
	 * 准备绘制.
	 * @param event
	 */
	protected drawBegin(event: MouseEvent | PointerEvent | Touch): void {
		const point = this.createPoint(event.clientX, event.clientY);
		if (this.type === 'area') {
			/** 区域截图 */
			this.buffer = this.createBuffer(2, 'rgb(255, 109, 31)');
			const ctx = this.getBufferContext();
			ctx.lineDashOffset = 3;
			ctx.setLineDash([5]);
			this.start = point;
		}
	}

	/**
	 * 绘制过程.
	 * @param event
	 */
	protected drawUpdate(event: MouseEvent | PointerEvent | Touch): void {
		const point = this.createPoint(event.clientX, event.clientY);
		if (this.type === 'area') {
			/** 区域截图 */
			const points = this.getPointsBasedOn2Point(this.start, point, this.rect);
			this.drawCropArea(points);
		}
	}

	/**
	 * 绘制结束.
	 * @param event
	 */
	protected drawEnd(event: MouseEvent | PointerEvent | Touch): void {
		if (this.type === 'area') this.drawUpdate(event);
		this.resetBuffer(() => {
			this.draw();
		});
	}
}
