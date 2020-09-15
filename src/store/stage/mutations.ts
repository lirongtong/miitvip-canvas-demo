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
import {MutationTree} from 'vuex';
import {MiStageState} from '@store/types';

export const mutations: MutationTree<MiStageState> = {
	SET_STAGES(state, stages): void {
		state.stages = stages;
	},
	SET_LAYERS(state, layers): void {
		state.layers = layers;
	},
	SET_ACTIVE_STAGE(state, id: string): void {
		state.active.stage = id;
	},
	SET_ACTIVE_LAYER(state, id: string): void {
		state.active.layer = id;
	}
};
