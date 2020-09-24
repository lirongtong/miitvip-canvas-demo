<template>
	<div class="mi-canvas-tools-item">
		<Tooltip content="恢复" :placement="G.mobile ? 'right' : 'top'">
            <span class="mi-canvas-tools-icon">
                <i class="iconfont icon-forward-solid" @click="forward" :style="{cursor}"></i>
            </span>
		</Tooltip>
	</div>
</template>

<script lang="ts">
	import {Component, Vue, Watch} from 'vue-property-decorator';
	import {Tools} from '@components/canvas/Tools';
	import {Getter} from 'vuex-class';
	import {stages} from '@components/canvas/Stage';

	const namespace = 'stage';

	@Component
	export default class ForwardComponent extends Vue {
		cursor = 'not-allowed';
		recoveries: any[] = [];

		@Getter('activeStage', {namespace}) active: any;

		@Watch('active')
		onStageChange() {
			const stage = stages[this.active];
			if (stage) this.recoveries = stage.recoveries;
		}

		@Watch('recoveries')
		onTracesChange(): void {
			const len = this.recoveries.length;
			this.cursor = len > 0 ? 'pointer' : 'not-allowed';
		}

		forward(): void {Tools.forward();}
	}
</script>
