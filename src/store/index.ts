import Vue from 'vue';
import Vuex from 'vuex';
import {stage} from '@store/stage';

Vue.use(Vuex);
const debug = process.env.NODE_ENV !== 'production';
export default new Vuex.Store({
	state: {version: '1.20.910'},
	modules: {stage},
	strict: debug
});
