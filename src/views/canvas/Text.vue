<template>
	<div class="mi-canvas-tools-item">
		<Tooltip content="文本" :placement="G.mobile ? 'right' : 'top'">
            <span class="mi-canvas-tools-icon" :class="active === 'text' ? 'active' : null">
                <i class="iconfont icon-text" @click="toolSelect('text')"></i>
            </span>
		</Tooltip>
	</div>
</template>

<script lang="ts">
	import {Component, Vue, Prop, Emit, Watch} from 'vue-property-decorator';
	import {Tools} from '@components/canvas/Tools';

	@Component
	export default class TextComponent extends Vue {
		@Prop() active: any;
		@Prop() color: any;
		@Prop() opacity: any;
		@Prop() thickness: any;

		colorChanged = false;

		@Emit() toolSelect(name: string) {}

		@Watch('color')
		onColorChange(): void {
			if (!this.colorChanged) this.colorChanged = true;
			this.setContentColor(this.color, this.opacity);
		}

		@Watch('opacity')
		onOpacityChange(): void {
			const color = this.colorChanged ? this.color : undefined;
			this.setContentColor(color, this.opacity);
		}

		@Watch('thickness')
		onThicknessChange(): void {
			if (Tools.getStage().tool === 'text') {
				const tool = Tools.getStage().tools['text'];
				if (tool) tool.setContentSizeAfterChange(this.thickness);
			}
		}

		/**
		 * 文本颜色变化.
		 * @param color
		 * @param opacity
		 */
		setContentColor(
			color?: string,
			opacity?: number
		): void {
			if (Tools.getStage().tool === 'text') {
				const tool = Tools.getStage().tools['text'];
				if (tool) tool.setContentColorAfterChange(color, opacity);
			}
		}
	}
</script>
