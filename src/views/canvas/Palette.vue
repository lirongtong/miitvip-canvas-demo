<template>
	<div class="mi-canvas-tools-item">
		<Poptip trigger="click"
				:placement="G.mobile ? 'right' : 'top'"
				popper-class="mi-canvas-palette"
				transfer>
            <span class="mi-canvas-tools-icon">
                <div class="mi-canvas-palette-active-color" :style="{background: palette}"></div>
            </span>
			<div slot="content">
				<Tabs value="palette">
					<TabPane label="调色板" name="palette">
						<div class="mi-canvas-palette-default">
							<RadioGroup v-model="color" class="mi-canvas-palette-swatches" @on-change="toolSelect">
								<div class="mi-canvas-palette-color" v-for="(name, hex) in colors" :key="hex">
									<Radio :label="hex">
										<span class="mi-canvas-palette-color-item" :style="{background: hex}" :name="hex" :title="name"></span>
									</Radio>
								</div>
							</RadioGroup>
						</div>
					</TabPane>
					<TabPane label="自定义" name="custom">
						<mi-color-picker
								v-model="palette"
								class="mi-canvas-palette-picker"
								@input="setColor">
						</mi-color-picker>
					</TabPane>
				</Tabs>
			</div>
		</Poptip>
	</div>
</template>

<script lang="ts">
	import {Component, Emit, Prop, Vue, Watch} from 'vue-property-decorator';
	import {Chrome} from 'vue-color';
	import {Utils} from '@components/canvas/Utils';

	@Component({
		components: {'mi-color-picker': Chrome}
	})
	export default class PaletteComponent extends Vue {

		@Prop() defaultColor: any;

		@Emit() toolSelect(color: string) {
			this.$set(this, 'color', color);
			this.$set(this, 'palette', color);
		}

		@Watch('defaultColor')
		onDefaultColorChange() {
			this.palette = this.defaultColor;
		}

		/** 默认颜色列表 */
		colors = Utils.getDefaultColor();

		/** 默认颜色列表选中值 */
		color = '#000000';

		/** 调色板选中值 */
		palette = '#000000';

		setColor(color: any): void {
			this.$set(this, 'palette', color.hex);
			this.toolSelect(this.palette);
		}
	}
</script>
