/*
 * +-------------------------------------------+
 * |                  MIITVIP                  |
 * +-------------------------------------------+
 * | Copyright (c) 2020 makeit.vip             |
 * +-------------------------------------------+
 * | Author: makeit <lirongtong@hotmail.com>   |
 * | Homepage: https://www.makeit.vip          |
 * | Github: https://git.makeit.vip            |
 * | Date: 2020-9-10 12:44                     |
 * +-------------------------------------------+
 */
import Vue from 'vue';

class MiStorage {

	private instance: Storage = localStorage;

	/**
	 * 初始化(构造).
	 * @param type
	 */
	constructor(type?: string) {
		if (type && type === 'session') this.instance = sessionStorage;
	}

	/**
	 * 获取 Storage.
	 * @param keys
	 */
	public get(keys: string | any[]): any {
		let data: any = {};
		if (Array.isArray(keys)) {
			for (let i = 0, len = keys.length; i < len; i++) {
				const key = keys[i],
					item = `${process.env.VUE_APP_PREFIX}${key}`;
				data[key] = JSON.parse(this.instance.getItem(item) as string);
			}
		} else {
			data = null;
			const key = `${process.env.VUE_APP_PREFIX}${keys}`;
			if (keys) data = JSON.parse(this.instance.getItem(key) as string);
		}
		return data;
	}

	/**
	 * 设置 Storage.
	 * @param key
	 * @param value
	 */
	public set(key: string, value: any) {
		const item = `${process.env.VUE_APP_PREFIX}${key}`;
		this.instance.setItem(item, JSON.stringify(value));
	}

	/**
	 * 删除 Storage.
	 * @param keys
	 */
	public del(keys: string | any[]) {
		if (Array.isArray(keys)) {
			for (let i = 0, len = keys.length; i < len; i++) {
				const key = keys[i],
					item = `${process.env.VUE_APP_PREFIX}${key}`;
				this.instance.removeItem(item);
			}
		} else {
			const item = `${process.env.VUE_APP_PREFIX}${keys}`;
			this.instance.removeItem(item);
		}
	}
}

declare module 'vue/types/vue' {
	interface Vue {
		storage: MiStorage;
	}
}
const instance = new MiStorage();
Vue.prototype.storage = instance;
export const storage = instance;
