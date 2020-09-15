<template>
	<div class="mi-canvas-tools-item">
		<Tooltip content="无限画布 ( 拖动 )" placement="top">
            <span class="mi-canvas-tools-icon" :class="active === 'drag' ? 'active' : null">
                <i class="iconfont icon-drag" @click="toolSelect('drag')"></i>
            </span>
		</Tooltip>
	</div>
</template>

<script lang="ts">
	import {Component, Emit, Prop, Vue} from 'vue-property-decorator';

	@Component
	export default class DragComponent extends Vue {
		@Prop() active: any;
		@Emit() toolSelect(name: string) {}
	}
</script>
