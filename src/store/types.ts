/*
 * +-------------------------------------------+
 * |                  MIITVIP                  |
 * +-------------------------------------------+
 * | Copyright (c) 2020 makeit.vip             |
 * +-------------------------------------------+
 * | Author: makeit <lirongtong@hotmail.com>   |
 * | Homepage: https://www.makeit.vip          |
 * | Github: https://git.makeit.vip            |
 * | Date: 2020-9-10 15:32                     |
 * +-------------------------------------------+
 */
export interface RootState {
	version: string;
}

export interface MiStageState {
	stages: {};
	layers: {};
	active: {
		stage: string;
		layer: string;
	};
}
