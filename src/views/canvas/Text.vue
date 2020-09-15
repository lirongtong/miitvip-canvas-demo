<template>
	<div class="mi-canvas-tools-item">
		<Tooltip content="橡皮擦" placement="top">
            <span class="mi-canvas-tools-icon">
                <i class="iconfont icon-text"></i>
            </span>
		</Tooltip>
	</div>
</template>

<script lang="ts">
	import {Component, Vue} from 'vue-property-decorator';

	@Component
	export default class TextComponent extends Vue {

	}
</script>
