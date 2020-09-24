<template>
	<div class="mi-canvas-tools-item">
		<Poptip trigger="click"
				popper-class="mi-canvas-eraser"
				:placement="G.mobile ? 'right' : 'top'"
				@on-popper-show="onPopperShow"
				transfer>
            <span class="mi-canvas-tools-icon" :class="active === 'eraser' ? 'active' : null">
                <i class="iconfont icon-eraser"></i>
            </span>
			<div slot="content">
				<div class="mi-canvas-eraser-item">
					<Tooltip placement="top" content="选择擦除">
						<i class="iconfont icon-eraser-dot" :class="type === 'select' ? 'active' : null" @click="toolSelect('select')" style="font-size: 22px"></i>
					</Tooltip>
					<Tooltip placement="top" content="清除屏幕">
						<i class="iconfont icon-eraser-clean" :class="type === 'clean' ? 'active' : null" @click="toolSelect('clean')"></i>
					</Tooltip>
				</div>
			</div>
		</Poptip>
	</div>
</template>

<script lang="ts">
	import {Component, Emit, Prop, Vue} from 'vue-property-decorator';

	@Component
	export default class EraserComponent extends Vue {
		@Prop() active: any;
		@Prop() type: any;

		@Emit() toolSelect(name: string) {}

		onPopperShow(): void {
			this.toolSelect(this.type === 'clean' ? 'select' : this.type);
		}
	}
</script>
