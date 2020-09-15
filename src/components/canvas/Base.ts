/*
 * +-------------------------------------------+
 * |                  MIITVIP                  |
 * +-------------------------------------------+
 * | Copyright (c) 2020 makeit.vip             |
 * +-------------------------------------------+
 * | Author: makeit <lirongtong@hotmail.com>   |
 * | Homepage: https://www.makeit.vip          |
 * | Github: https://git.makeit.vip            |
 * | Date: 2020-9-10 15:39                     |
 * +-------------------------------------------+
 */
export abstract class Base {
	/**
	 * 事件绑定.
	 * @param event
	 * @param callback
	 */
	public abstract on(
		event: keyof HTMLElementEventMap,
		callback: (...args: any) => {}
	): void;

	/**
	 * 事件解绑.
	 * @param event
	 * @param callback
	 */
	public abstract off(
		event: keyof HTMLElementEventMap,
		callback: (...args: any) => {}
	): void;

	/** 绘制. */
	public abstract draw(): void;
}
