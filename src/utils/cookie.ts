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

class MiCookie {

	/**
	 * 获取 Cookie.
	 * @param key
	 */
	public get(key: string): any {
		const name = `${process.env.VUE_APP_PREFIX}${key}=`,
			values = document.cookie.split(';');
		for (let i = 0, len = values.length; i < len; i++) {
			let value = values[i];
			while (value.charAt(0) === ' ') value = value.substring(1);
			if (value.indexOf(name) !== -1) {
				return value.substring(name.length, value.length);
			}
		}
		return null;
	}

	/**
	 * 设置 Cookie.
	 * @param name
	 * @param value
	 * @param expire
	 */
	public set(name: string, value: any, expire: number | null): void {
		let expires;
		if (expire) {
			const date = new Date();
			date.setTime(date.getTime() + (expire * 24 * 60 * 60 * 1000));
			expires = `expires=${date.toUTCString()}`;
		}
		const params = [
			`${process.env.VUE_APP_PREFIX}${name}=${escape(value)}`,
			expires,
			'path=/'
		];
		document.cookie = params.join(';');
	}

	/**
	 * 删除 Cookie.
	 * @param names
	 */
	public del(names: string | any[]): void {
		if (Array.isArray(names)) {
			for (let i = 0, len = names.length; i < len; i++) {
				const name = names[i];
				if (name) this.set(name, '', -1);
			}
		} else {
			this.set(names, '', -1);
		}
	}
}

declare module 'vue/types/vue' {
	interface Vue {
		cookie: MiCookie;
	}
}
const instance = new MiCookie();
Vue.prototype.cookie = instance;
export const cookie = instance;
