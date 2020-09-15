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
import axios, {AxiosRequestConfig} from 'axios';
import {cookie} from '@utils/cookie';
import {G} from '@utils/config';
import router from '@/router'
import {Message} from 'view-design';

const domain = process.env.VUE_APP_PROXY_SERVER ?? '/';
axios.defaults.baseURL = domain;
axios.defaults.withCredentials = true;
axios.defaults.headers.common['Content-Type'] = 'application/json;charset=UTF-8;';

/** 拦截器 - 请求 */
axios.interceptors.request.use((config) => {
	const token = cookie.get(G.caches.cookies.token.access);
	if (token) config.headers.Authorization = `Bearer ${token}`;
	return config;
}, (err) => {
	return Promise.reject(err);
});

class MiHttp {

	constructor() {
		this.register();
	}

	/**
	 * 发送请求.
	 * @param config
	 */
	private sendRequest(config: AxiosRequestConfig) {
		if (!config.timeout) config.timeout = 60000;
		return axios(config).then((res) => {
			return Promise.resolve({
				ret: {
					code: res.data.code,
					msg: res.data.msg
				},
				data: res.data.data
			});
		}).catch((err) => {
			const status = err && err.response && err.response.status;
			switch (status) {
				case 400:
					(Message as any).error({
						background: true,
						content: '请求错误',
						duration: 3
					});
					break;

				case 401:
					(Message as any).error({
						background: true,
						content: 'Token 失效,请重新登录',
						duration: 3
					});
					const {pending} = (router as any).history;
					pending ? router.push({
						path: '/login',
						query: {redirect: pending.fullPath}
					}) : router.replace('/login');
					break;

				case 403:
					(Message as any).error({
						background: true,
						content: '拒绝访问',
						duration: 3
					});
					break;

				case 404:
					(Message as any).error({
						background: true,
						content: '请求错误,未找到该资源',
						duration: 3
					});
					break;

				case 405:
					(Message as any).error({
						background: true,
						content: '请求方法未允许',
						duration: 3
					});
					break;

				case 408:
					(Message as any).error({
						background: true,
						content: '请求超时',
						duration: 3
					});
					break;

				case 500:
					(Message as any).error({
						background: true,
						content: '服务器端出错',
						duration: 3
					});
					break;

				case 501:
					(Message as any).error({
						background: true,
						content: '网络未实现',
						duration: 3
					});
					break;

				case 502:
					(Message as any).error({
						background: true,
						content: '网络错误',
						duration: 3
					});
					break;

				case 503:
					(Message as any).error({
						background: true,
						content: '服务不可用',
						duration: 3
					});
					break;

				case 504:
					(Message as any).error({
						background: true,
						content: '网络超时',
						duration: 3
					});
					break;

				case 505:
					(Message as any).error({
						background: true,
						content: 'HTTP 版本不支持该请求',
						duration: 3
					});
					break;

				default:
					(Message as any).error({
						background: true,
						content: status ? `服务器连接错误 ${err.response.status}` : `服务器连接错误`,
						duration: 3
					});
					break;
			}
			return Promise.reject(err);
		});
	}

	/**
	 * 注册常用方法.
	 * @param name
	 * @param callback
	 */
	public register(
		name?: string,
		callback?: Function
	) {
		const vm: any = this;
		if (name) {
			vm[name.trim()] = (...args: any[]) => {
				if (callback) callback.call(vm, ...args);
			}
		} else {
			['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'].forEach((key) => {
				vm[key.toLowerCase()] = (
					url: string,
					data: { [index: string]: any },
					config?: AxiosRequestConfig
				) => {
					const args = {
						...config,
						url,
						data,
						method: key.toUpperCase()
					} as AxiosRequestConfig;
					if (key === 'GET') {
						delete args.data;
						args.params = data;
					}
					return this.sendRequest(args);
				};
			});
		}
	}
}

declare module 'vue/types/vue' {
	interface Vue {
		$http: MiHttp;
	}
}
const instance = new MiHttp();
Vue.prototype.$http = instance;
export const http = instance;
