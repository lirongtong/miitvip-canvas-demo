<template>
	<div class="mi-canvas-tools-item">
		<Poptip trigger="click"
				popper-class="mi-canvas-screenshot"
				:placement="G.mobile ? 'right' : 'top'"
				@on-popper-show="onPopperShow"
				transfer>
            <span class="mi-canvas-tools-icon" :class="active === 'screenshot' ? 'active' : null">
                <i class="iconfont icon-crop"></i>
            </span>
			<div slot="content">
				<div class="mi-canvas-screenshot-item">
					<Tooltip placement="top" content="区域截图">
						<i class="iconfont icon-screen-shot" :class="type === 'area' ? 'active' : null" @click="toolSelect('area')"></i>
					</Tooltip>
					<Tooltip placement="top" content="屏幕截图">
						<i class="iconfont icon-screenshot" :class="type === 'screen' ? 'active' : null" @click="toolSelect('screen')"></i>
					</Tooltip>
				</div>
			</div>
		</Poptip>
	</div>
</template>

<script lang="ts">
	import {Component, Vue, Prop, Emit} from 'vue-property-decorator';

	@Component
	export default class ScreenshotComponent extends Vue {
		@Prop() active: any;
		@Prop() type: any;

		@Emit() toolSelect(name: string) {}

		onPopperShow(): void {
			this.toolSelect(this.type === 'screen' ? 'area' : this.type);
		}
	}
</script>
