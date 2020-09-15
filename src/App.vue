<template>
	<router-view></router-view>
</template>

<script lang="ts">
	import {Component, Vue} from 'vue-property-decorator';
	import {Utils} from '@components/canvas/Utils';

	@Component
	export default class AppComponent extends Vue {
		beforeCreate() {
			this.G.mobile = Utils.isMobile();
		}

		mounted() {
			Utils.setTitle();
			Utils.setKeywords();
			Utils.setDescription();
			document.oncontextmenu = () => {
				return false;
			}
		}
	}
</script>
