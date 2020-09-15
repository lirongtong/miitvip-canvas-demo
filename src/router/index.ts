import Vue from 'vue';
import VueRouter, {RouteConfig} from 'vue-router';
const Canvas = () => import('@views/canvas/Index.vue');

Vue.use(VueRouter);

const routes: Array<RouteConfig> = [
	{
		path: '/',
		name: 'Canvas',
		component: Canvas
	}
];

const router = new VueRouter({
	mode: 'history',
	base: process.env.BASE_URL,
	routes
});

export default router;
