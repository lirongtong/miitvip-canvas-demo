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
import {Module} from 'vuex';
import {MiStageState, RootState} from '@store/types';
import {getters} from '@store/stage/getters';
import {mutations} from '@store/stage/mutations';

export const state: MiStageState = {
	stages: {},
	layers: {},
	active: {
		stage: '',
		layer: ''
	}
};
const namespaced = true;
export const stage: Module<MiStageState, RootState> = {
	namespaced,
	state,
	getters,
	mutations
};
