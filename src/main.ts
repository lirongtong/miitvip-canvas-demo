import Vue from 'vue';

import router from '@/router';
import store from '@/store';

import '@utils/config';
import '@utils/cookie';
import '@utils/storage';
import '@utils/http';
import '@/modules';
import '@styles/app.less';

Vue.config.productionTip = false;
const App = () => import('@/App.vue');
new Vue({
	router,
	store,
	render: h => h(App)
}).$mount('#app');
