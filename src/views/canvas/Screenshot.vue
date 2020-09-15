<template>
	<div class="mi-canvas-tools-item">
		<Tooltip content="截图" placement="top">
            <span class="mi-canvas-tools-icon">
                <i class="iconfont icon-crop"></i>
            </span>
		</Tooltip>
	</div>
</template>

<script lang="ts">
	import {Component, Vue} from 'vue-property-decorator';

	@Component
	export default class ScreenshotComponent extends Vue {

	}
</script>
