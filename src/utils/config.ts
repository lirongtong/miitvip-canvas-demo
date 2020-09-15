/*
 * +-------------------------------------------+
 * |                  MIITVIP                  |
 * +-------------------------------------------+
 * | Copyright (c) 2020 makeit.vip             |
 * +-------------------------------------------+
 * | Author: makeit <lirongtong@hotmail.com>   |
 * | Homepage: https://www.makeit.vip          |
 * | Github: https://git.makeit.vip            |
 * | Date: 2020-9-10 12:49                     |
 * +-------------------------------------------+
 */
import Vue from 'vue';

/**
 * 公用常量.
 * ```
 * this.G.title
 * ```
 */
class MiConfig {
	/** 调试模式 */
	public debug = true;

	/** 前缀 */
	public prefix: string = process.env.VUE_APP_PREFIX ?? 'mi-';

	/** 标题 */
	public title = '涂鸦白板';

	/** 所有权 */
	public powered = '麦可易特网';

	/** 加密盐值 */
	public salt = this.prefix + 'bXrf4dJbLlf0u8X3';

	/** 关键词 */
	public keywords = 'fonxconn, vue, typescript, view-design';

	/** 描述 */
	public description = '麦可易特网涂鸦白板';

	/** 是否为移动端 */
	public mobile = false;

	/** 是否为触摸屏 */
	public supportsTouch = ('ontouchstart' in window) || navigator.msMaxTouchPoints;

	/** 通用正则 */
	public reg: {[index: string]: any} = {
		phone: /^1[3456789]\d{9}$/,
		url: /^((https|http|ftp|rtsp|mms)?:\/\/)(([0-9A-Za-z_!~*'().&=+$%-]+: )?[0-9A-Za-z_!~*'().&=+$%-]+@)?(([0-9]{1,3}.){3}[0-9]{1,3}|([0-9A-Za-z_!~*'()-]+.)*([0-9A-Za-z][0-9A-Za-z-]{0,61})?[0-9A-Za-z].[A-Za-z]{2,6})(:[0-9]{1,4})?((\/?)|(\/[0-9A-Za-z_!~*'().;?:@&=+$,%#-]+)+\/?)$/,
		password: /^[A-Za-z0-9~!@#$%^&*()_+=\-.,]{6,32}$/,
		username: /^[a-zA-Z]{1}([a-zA-Z0-9]|[_]){3,31}$/
	};

	/** storage 与 cookie 的 keys 值统一存放字段 */
	public caches: {[index: string]: any} = {
		storages: {},
		cookies: {
			auto: 'auto-login',
			token: {
				access: 'token',
				refresh: 'refresh-token'
			}
		}
	};
}

declare module 'vue/types/vue' {
	interface Vue {
		G: MiConfig;
	}
}
const instance = new MiConfig();
Vue.prototype.G = instance;
export const G = instance;
