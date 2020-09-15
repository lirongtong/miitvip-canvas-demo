/*
 * +-------------------------------------------+
 * |                  MIITVIP                  |
 * +-------------------------------------------+
 * | Copyright (c) 2020 makeit.vip             |
 * +-------------------------------------------+
 * | Author: makeit <lirongtong@hotmail.com>   |
 * | Homepage: https://www.makeit.vip          |
 * | Github: https://git.makeit.vip            |
 * | Date: 2020-9-9 13:12                      |
 * +-------------------------------------------+
 */
const path = require('path');
const resolve = (dir) => path.join(__dirname, dir);

module.exports = {
	pluginOptions: {
		'style-resources-loader': {
			preProcessor: 'less',
			patterns: [
				resolve('src/assets/styles/app.less')
			]
		}
	},
	runtimeCompiler: true,
	productionSourceMap: false,
	lintOnSave: false,
	parallel: false,
	configureWebpack: config => {
		config.performance = {
			hints: 'warning',
			maxEntrypointSize: 51200000,
			maxAssetSize: 30000000,
			assetFilter: function (assetFilename) {
				return assetFilename.endsWith('.js');
			}
		};
		config.entry.app = resolve('src/main.ts');
	},
	chainWebpack: config => {
		config.resolve.alias
			.set('@', resolve('src'))
			.set('@assets', resolve('src/assets'))
			.set('@utils', resolve('src/utils'))
			.set('@components', resolve('src/components'))
			.set('@views', resolve('src/views'))
			.set('@styles', resolve('src/assets/styles'))
			.set('@images', resolve('src/assets/images'))
			.set('@store', resolve('src/store'));
		config.module
			.rule('worker-loader')
			.test('/\\.worker\\.ts$/')
			.use('worker-loader')
			.loader('worker-loader')
			.end();
	},
	devServer: {
		disableHostCheck: true,
		proxy: {
			'/v1/': {
				target: process.env.VUE_APP_PROXY_SERVER,
				changeOrigin: true,
				pathRewrite: {'^/v1': '/'}
			}
		}
	},
	css: {
		loaderOptions: {
			less: {
				javascriptEnabled: true,
			}
		}
	}
}
