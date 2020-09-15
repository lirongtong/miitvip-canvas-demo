<template>
	<div class="mi-canvas-tools-item">
		<Poptip trigger="click"
				popper-class="mi-canvas-brush"
				placement="top"
				@on-popper-show="showPopper"
				transfer>
            <span class="mi-canvas-tools-icon" :class="active === 'brush' ? 'active' : null">
                <i :class="`iconfont icon-${icon}`"></i>
            </span>
			<div slot="content">
				<div class="mi-canvas-brush-item" id="mi-canvas-brush-item">
					<Tooltip :content="tool.name" v-for="(tool, index) in tools" :key="index" :placement="index > 3 ? 'bottom' : 'top'">
						<i class="iconfont" :class="getActiveClass(tool)" @click="toolSelect(tool)"></i>
					</Tooltip>
				</div>
			</div>
		</Poptip>
	</div>
</template>

<script lang="ts">
	import {Component, Emit, Prop, Vue} from 'vue-property-decorator';
	import {MiBrushData} from '@components/canvas/Tools';

	@Component
	export default class BrushComponent extends Vue {
		@Prop() active: any;
		@Prop() color: any;
		@Prop() solid: any;
		@Prop() icon: any;

		@Emit() onShow(name: string) {
		}

		@Emit() toolSelect(tool: MiBrushData) {
			this.selection = tool.tool;
		}

		/** 选中工具 */
		selection = '';

		tools: { [index: number]: MiBrushData } = {
			0: {name: '记号笔', icon: 'pencil', tool: 'marker'},
			1: {name: '激光笔', icon: 'laser', tool: 'laser'},
			2: {name: '直线', icon: 'line', tool: 'line'},
			3: {name: '箭头', icon: 'arrow', tool: 'arrow'},
			4: {name: '实心圆形', icon: 'circle-solid', tool: 'circle', solid: true},
			5: {name: '空心圆形', icon: 'circle', tool: 'circle', solid: false},
			6: {name: '实心矩形', icon: 'rect-solid', tool: 'rect', solid: true},
			7: {name: '空心矩形', icon: 'rect', tool: 'rect', solid: false}
		};

		showPopper(): void {
			if (!this.selection) this.selection = 'marker';
			this.onShow('brush');
		}

		getActiveClass(tool: MiBrushData) {
			const condition = this.selection === tool.tool &&
				(tool.solid !== undefined ? this.solid === tool.solid : true);
			return condition ? `icon-${tool.icon} active` : `icon-${tool.icon}`;
		}
	}
</script>
