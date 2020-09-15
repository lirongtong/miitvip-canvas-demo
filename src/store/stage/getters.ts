/*
 * +-------------------------------------------+
 * |                  MIITVIP                  |
 * +-------------------------------------------+
 * | Copyright (c) 2020 makeit.vip             |
 * +-------------------------------------------+
 * | Author: makeit <lirongtong@hotmail.com>   |
 * | Homepage: https://www.makeit.vip          |
 * | Github: https://git.makeit.vip            |
 * | Date: 2020-9-10 15:34                     |
 * +-------------------------------------------+
 */
import {GetterTree} from 'vuex';
import {MiStageState, RootState} from '@store/types';

export const getters: GetterTree<MiStageState, RootState> = {
	stages(state): any {
		return state.stages;
	},
	layers(state): any {
		return state.layers;
	},
	activeStage(state): string {
		return state.active.stage;
	},
	activeLayer(state): string {
		return state.active.layer;
	}
};
