/*
 * +-------------------------------------------+
 * |                  MIITVIP                  |
 * +-------------------------------------------+
 * | Copyright (c) 2020 makeit.vip             |
 * +-------------------------------------------+
 * | Author: makeit <lirongtong@hotmail.com>   |
 * | Homepage: https://www.makeit.vip          |
 * | Github: https://git.makeit.vip            |
 * | Date: 2020-9-9 13:23                      |
 * +-------------------------------------------+
 */
import Vue from 'vue';
export abstract class Events extends Vue {

	static customEventListeners: any = {};
	protected events: any = {};

	protected constructor() {
		super();
		let events: {[index: string]: any} = {
			pointerdown: this.pointerdown,
			pointermove: this.pointermove,
			pointerup: this.pointerup,
			pointerenter: this.pointerenter,
			pointerleave: this.pointerleave
		};
		if (!window.PointerEvent) {
			events = {
				mousedown: this.pointerdown,
				mousemove: this.pointermove,
				mouseup: this.pointerup,
				mouseenter: this.pointerenter,
				mouseleave: this.pointerleave,
				touchstart: this.touchstart,
				touchmove: this.touchmove,
				touchend: this.touchend
			};
		}
		for (const i in events) {
			if (Object.prototype.hasOwnProperty.call(events, i)) {
				this.registerEvent(i as keyof HTMLElementEventMap, (
					evt: HTMLElementEventMap[keyof HTMLElementEventMap]
				) => {
					events[i].call(this, evt);
				});
			}
		}
	}

	/**
	 * 注册事件.
	 * @param event
	 * @param callback
	 */
	public registerEvent(
		event: keyof HTMLElementEventMap,
		callback: (
			this: HTMLDivElement,
			evt: HTMLElementEventMap[keyof HTMLElementEventMap]
		) => any
	): void {
		const name = event.toString().toLowerCase();
		this.events[name] = {
			name: name,
			callback: callback
		};
	}

	/**
	 * 触发事件.
	 * @param event
	 * @param evt
	 */
	public fireEvent(
		event: string,
		evt: HTMLElementEventMap[keyof HTMLElementEventMap]
	) {
		for (const i in this.events) {
			if (Object.prototype.hasOwnProperty.call(this.events, i)) {
				if (event.toUpperCase() === i.toUpperCase()) {
					this.events[i].callback.call(this, evt);
					break;
				}
			}
		}
	}

	/**
	 * 移除自定义事件列表.
	 * @return void
	 */
	public static removeCustomEventListeners() {
		Events.customEventListeners = {};
	}

	/**
	 * 按下.
	 * @param event
	 */
	protected abstract pointerdown(event: PointerEvent | MouseEvent): void;

	/**
	 * 移动.
	 * @param event
	 */
	protected abstract pointermove(event: PointerEvent | MouseEvent): void;

	/**
	 * 抬起.
	 * @param event
	 */
	protected abstract pointerup(event: PointerEvent | MouseEvent): void;

	/**
	 * 进入.
	 * @param event
	 */
	protected abstract pointerenter(event: PointerEvent | MouseEvent): void;

	/**
	 * 离开.
	 * @param event
	 */
	protected abstract pointerleave(event: PointerEvent | MouseEvent): void;

	/**
	 * 触摸开始.
	 * @param event
	 */
	protected abstract touchstart(event: TouchEvent): void;

	/**
	 * 触摸移动.
	 * @param event
	 */
	protected abstract touchmove(event: TouchEvent): void;

	/**
	 * 触摸结束.
	 * @param event
	 */
	protected abstract touchend(event: TouchEvent): void;
}
