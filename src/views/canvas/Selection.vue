<template>
	<div class="mi-canvas-tools-item">
		<Tooltip content="选择" :placement="G.mobile ? 'right' : 'top'">
            <span class="mi-canvas-tools-icon" :class="active === 'selection' ? 'active' : null">
                <i class="iconfont icon-select" @click="toolSelect('selection')"></i>
            </span>
		</Tooltip>
	</div>
</template>

<script lang="ts">
	import {Component, Emit, Prop, Vue} from 'vue-property-decorator';

	@Component
	export default class SelectionComponent extends Vue {
		@Prop() active: any;

		@Emit() toolSelect(name: string) {
		}
	}
</script>
