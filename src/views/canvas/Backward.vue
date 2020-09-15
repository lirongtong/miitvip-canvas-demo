<template>
	<div class="mi-canvas-tools-item">
		<Tooltip content="回撤" placement="top">
            <span class="mi-canvas-tools-icon">
                <i class="iconfont icon-backward-solid"></i>
            </span>
		</Tooltip>
	</div>
</template>

<script lang="ts">
	import {Component, Vue} from 'vue-property-decorator';

	@Component
	export default class BackwardComponent extends Vue {

	}
</script>
