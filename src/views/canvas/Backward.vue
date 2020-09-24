<template>
	<div class="mi-canvas-tools-item">
		<Tooltip content="回撤" :placement="G.mobile ? 'right' : 'top'">
            <span class="mi-canvas-tools-icon">
                <i class="iconfont icon-backward-solid" @click="backward" :style="{cursor}"></i>
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
	export default class BackwardComponent extends Vue {
		cursor = 'not-allowed';
		traces: any[] = [];

		@Getter('activeStage', {namespace}) active: any;

		@Watch('active')
		onStageChange() {
			const stage = stages[this.active];
			if (stage) this.traces = stage.traces;
		}

		@Watch('traces')
		onTracesChange(): void {
			const len = this.traces.length;
			this.cursor = len > 0 ? 'pointer' : 'not-allowed';
		}

		backward(): void {Tools.backward();}
	}
</script>
