/*
 * +-------------------------------------------+
 * |                  MIITVIP                  |
 * +-------------------------------------------+
 * | Copyright (c) 2020 makeit.vip             |
 * +-------------------------------------------+
 * | Author: makeit <lirongtong@hotmail.com>   |
 * | Homepage: https://www.makeit.vip          |
 * | Github: https://git.makeit.vip            |
 * | Date: 2020-9-10 15:42                     |
 * +-------------------------------------------+
 */
import {G} from '@utils/config';
import {Events} from '@components/canvas/Events';

export const Utils = {
	/**
	 * 生成UID.
	 * @param upper
	 */
	uid(upper = true): string {
		const uid = G.prefix + this.randomString() + this.randomString() + this.randomString() +
			this.randomString() + this.randomString() + this.randomString() +
			this.randomString() + this.randomString();
		return upper ? uid.toUpperCase() : uid;
	},

	/**
	 * 事件绑定.
	 * @param element
	 * @param event
	 * @param callback
	 */
	on(
		element: Window | HTMLElement | HTMLDivElement,
		event: keyof HTMLElementEventMap | any,
		callback: (
			this: HTMLElement | HTMLDivElement,
			evt: HTMLElementEventMap[keyof HTMLElementEventMap] | any
		) => any
	) {
		if (!(element instanceof Window)) element.style.touchAction = 'none';
		if (!!document.addEventListener) {
			if (element && event && callback) {
				if (!Events.customEventListeners[event]) Events.customEventListeners[event] = [];
				Events.customEventListeners[event].push({
					id: (element as any).id ?? this.uid(),
					event,
					callback
				});
				element.addEventListener(event, callback, false);
			}
		} else {
			if (element && event && callback) {
				if (!Events.customEventListeners[event]) Events.customEventListeners[event] = [];
				Events.customEventListeners[event].push({
					id: (element as any).id ?? this.uid(),
					event,
					callback
				});
				(element as any).attachEvent('on' + event, callback);
			}
		}
	},

	/**
	 * 事件解绑.
	 * @param element
	 * @param event
	 * @param callback
	 */
	off(
		element: Window | HTMLElement | HTMLDivElement,
		event: keyof HTMLElementEventMap | any,
		callback: (
			this: HTMLElement | HTMLDivElement,
			evt: HTMLElementEventMap[keyof HTMLElementEventMap] | any
		) => any
	) {
		if (!(element instanceof Window)) element.style.touchAction = 'auto';
		Events.customEventListeners[event] && delete Events.customEventListeners[event];
		if (!!document.removeEventListener) {
			element.removeEventListener(event, callback, false);
		} else {
			(element as any).detachEvent('on' + event, callback);
		}
	},

	/**
	 * 设置标题.
	 * @param title
	 */
	setTitle(title?: string): void {
		title = title ?? G.title;
		document.title = `${title} - ${G.powered}`;
	},

	/**
	 * 设置关键词.
	 * @param keywords
	 */
	setKeywords(keywords?: string) {
		keywords = keywords ?? G.keywords;
		const keyword = document.querySelector(`meta[name="keywords"]`);
		if (keyword) keyword.setAttribute('content', keywords);
		else this.createMeta('keywords', keywords);
	},

	/**
	 * 设置描述.
	 * @param desc
	 */
	setDescription(desc?: string) {
		desc = desc ?? G.description;
		const description = document.querySelector(`meta[name="description"]`);
		if (description) description.setAttribute('content', desc);
		else this.createMeta('description', desc);
	},

	/**
	 * 创建 Meta 标签.
	 * @param name
	 * @param content
	 */
	createMeta(name: string, content: string) {
		const head = document.getElementsByTagName('head'),
			meta = document.createElement('meta');
		meta.name = name.trim();
		meta.content = content.trim();
		if (head) head[0].appendChild(meta);
	},

	/**
	 * 检测是否为移动端.
	 * @returns {boolean}
	 */
	isMobile(): boolean {
		const agent = navigator.userAgent,
			agents = ['Android', 'iPhone', 'SymbianOS', 'Windows Phone', 'iPad', 'iPod'];
		let mobile = false;
		for (let i = 0, len = agents.length; i < len; i++) {
			if (agent.indexOf(agents[i]) > 0) {
				mobile = true;
				break;
			}
		}
		return mobile;
	},

	/**
	 * 创建画板元素.
	 * @return HTMLCanvasElement
	 */
	createCanvasElement(): HTMLCanvasElement {
		const canvas = document.createElement('canvas');
		try {
			(canvas as any).style = canvas.style || {};
		} catch (e) {
			console.log('create canvas failed.');
		}
		return canvas;
	},

	/**
	 * 随机字符串.
	 * @return string
	 */
	randomString(): string {
		return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
	},

	/**
	 * 滚动至顶部.
	 * @param id
	 * @param toBottom
	 */
	scrollToTop(id: string, toBottom = false): void {
		const elem = document.getElementById(id);
		if (elem) elem.scrollTop = toBottom ? elem.scrollHeight : 0;
	},

	/**
	 * 颜色列表.
	 * @return Object
	 */
	getDefaultColor(): {} {
		return {
			'#000000': '黑色',
			'#5f6368': '灰色 700',
			'#9aa0a6': '灰色 500',
			'#dadce0': '灰色 300',
			'#f1f3f4': '灰色 100',
			'#ffffff': '白色',
			'#f28b82': '红色 300',
			'#fdd663': '黄色 300',
			'#81c995': '绿色 300',
			'#78d9ec': '青色 300',
			'#8ab4f8': '蓝色 300',
			'#c58af9': '紫色 300',
			'#ea4335': '红色 500',
			'#fbbc04': '黄色 500',
			'#34a853': '绿色 500',
			'#24c1e0': '青色 500',
			'#4285f4': '蓝色 500',
			'#a142f4': '紫色 500',
			'#c5221f': '红色 700',
			'#f29900': '黄色 700',
			'#188038': '绿色 700',
			'#12a4af': '青色 700',
			'#1967d2': '蓝色 700',
			'#8430ce': '紫色 700'
		};
	},

	/**
	 * 十六进制颜色值转RGBA.
	 * @param color
	 * @param opacity
	 */
	colorHexToRgba(color: string, opacity = 1): string {
		const reg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/;
		if (reg.test(color)) {
			if (color.length === 4) {
				let newColor = '#';
				for (let i = 1; i < 4; i++) {
					newColor += color.slice(i, i + 1).concat(color.slice(i, i + 1));
				}
				color = newColor;
			}
			const changeColor: number[] = [];
			for (let i = 1; i < 7; i += 2) {
				changeColor.push(parseInt('0x' + color.slice(i, i + 2)));
			}
			return `rgba(${changeColor.join(',')}, ${opacity})`;
		} else {
			return color;
		}
	},

	/**
	 * 深拷贝.
	 * @param obj
	 */
	deepCopy(obj: any): any {
		let newObj = {} as any;
		if (Array.isArray(obj)) newObj = [];
		for (const i in obj) {
			if (Object.prototype.hasOwnProperty.call(obj, i)) {
				if (typeof obj[i] === 'object') {
					newObj[i] = this.deepCopy(obj[i]);
				} else {
					newObj[i] = obj[i];
				}
			}
		}
		return newObj;
	}
}
