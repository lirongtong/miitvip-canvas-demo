<template>
	<div class="mi-canvas-tools-item">
		<Poptip trigger="click"
				placement="top"
				popper-class="mi-canvas-thickness"
				transfer>
            <span class="mi-canvas-tools-icon">
                <i class="iconfont icon-thickness"></i>
            </span>
			<div class="mi-canvas-thickness-container" slot="content">
				<div class="mi-canvas-thickness-controls">
					<div class="mi-canvas-thickness-controls-column">
						<label class="mi-canvas-thickness-size"><span>大小</span></label>
						<label class="mi-canvas-thickness-opacity"><span>不透明度</span></label>
					</div>
					<div class="mi-canvas-thickness-controls-slider">
						<div class="mi-canvas-thickness-controls-column">
							<Slider v-model="thickness" :min="range.min" :max="range.max" @on-input="changeThickness"></Slider>
							<Slider v-model="opacity" :min="0.1" :max="1" :step="0.1" @on-input="changeThickness"></Slider>
						</div>
					</div>
				</div>
			</div>
		</Poptip>
	</div>
</template>

<script lang="ts">
	import {Component, Emit, Prop, Vue, Watch} from 'vue-property-decorator';

	@Component
	export default class ThicknessComponent extends Vue {
		@Prop() active: any;
		@Prop() defaultThickness: any;
		@Prop() defaultOpacity: any

		thickness = 20;
		range = {min: 20, max: 100};
		opacity = 0.8;

		@Emit() changeThickness(thickness: number) {
		}

		@Watch('active')
		onActiveChange(value: string) {
			switch (value) {
				case 'marker':
				case 'line':
					this.range.min = 20;
					break;
				case 'text':
					this.range.min = 28;
					break;
				case 'circle':
				case 'rect':
				case 'arrow':
					this.range.min = 10;
					break;
			}
			if (this.thickness < this.range.min) this.thickness = this.range.min;
		}

		@Watch('defaultThickness')
		onDefaultThicknessChange() {
			this.thickness = this.defaultThickness;
		}

		@Watch('defaultOpacity')
		onDefaultOpacity() {
			this.opacity = this.defaultOpacity;
		}
	}
</script>
