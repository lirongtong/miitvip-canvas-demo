<template>
	<Poptip trigger="click"
			popper-class="mi-canvas-layers"
			placement="top-end"
			@on-popper-hide="onPopperHide"
			@on-popper-show="onPopperShow"
			transfer>
			<span class="mi-canvas-tools-icon">
				<i class="iconfont icon-layer"></i>
			</span>
		<div slot="content">
			<div class="mi-canvas-layers-container" v-show="visible.layer">
				<div class="mi-canvas-layers-title">
					<span>图层管理</span>
					<div class="mi-canvas-layers-title-btns">
						<Tooltip content="添加图层" placement="top">
							<i class="iconfont icon-add" @click="layerCreate"></i>
						</Tooltip>
					</div>
				</div>
				<div class="mi-canvas-layers-wrapper">
					<div class="mi-canvas-layers-list" id="mi-canvas-layers-list">
						<div class="mi-canvas-layers-list-item" v-for="layer in layers" :key="layer.id" :class="active === layer.id ? 'active' : null">
							<div class="mi-canvas-layers-list-btns" :style="borderHeight">
								<icon type="ios-eye-outline" size="24" @click="layerState(layer.id)" title="隐藏图层" v-if="!layer.hidden"></icon>
								<icon type="ios-eye-off-outline" size="24" @click="layerState(layer.id)" title="显示图层" v-else></icon>
								<icon type="ios-trash-outline" size="24" @click="layerDelete(layer.id)" title="移除图层"></icon>
							</div>
							<div class="mi-canvas-layers-list-thumbnail-bg" title="图层切换" @click="layerChange(layer.id)" :style="thumbHeight">
								<div class="mi-canvas-layers-list-thumbnail" :id="layer.id" :style="layer.thumb ? {backgroundImage: `url('${layer.thumb}')`, backgroundSize: 'cover', backgroundPosition: 'no-repeat'} : {}"></div>
							</div>
						</div>
						<div class="mi-canvas-layers-list-item" id="mi-canvas-paint-bucket">
							<div class="mi-canvas-layers-list-btns">
								<icon type="ios-eye-outline" size="24" @click="visibleBackgroundColorOrNot" v-if="visible.background" title="背景处于可见状态，点击此按钮即可隐藏"></icon>
								<icon type="ios-eye-off-outline" size="24" @click="visibleBackgroundColorOrNot" v-else title="背景处于不可见状态，点击此按钮即可显示"></icon>
							</div>
							<div class="mi-canvas-layers-list-thumbnail-bg" @click="setColorPalette" title="更改背景色">
								<i class="iconfont icon-paint-bucket"></i>
								<div class="mi-canvas-paint-bucket" :style="{backgroundColor: backgroundColor}"></div>
							</div>
						</div>
					</div>
				</div>
			</div>
			<div class="mi-canvas-palette" v-show="visible.palette">
				<div class="mi-canvas-layers-title">
					<Tooltip content="返回图层管理" placement="right">
						<icon type="ios-arrow-round-back" size="28" @click="setColorPalette"></icon>
					</Tooltip>
					<span>背景颜色</span>
				</div>
				<Tabs value="palette">
					<TabPane label="调色板" name="palette">
						<div class="mi-canvas-palette-default">
							<RadioGroup v-model="color" class="mi-canvas-palette-swatches" @on-change="setBackgroundColor">
								<div class="mi-canvas-palette-color" v-for="(name, hex) in colors" :key="hex">
									<Radio :label="hex">
										<span class="mi-canvas-palette-color-item" :style="{background: hex}" :name="hex" :title="name"></span>
									</Radio>
								</div>
							</RadioGroup>
						</div>
					</TabPane>
					<TabPane label="自定义" name="custom">
						<color-picker v-model="palette" class="mi-canvas-palette-picker mi-canvas-layers-palette-picker" @input="updatePickerColor"></color-picker>
					</TabPane>
				</Tabs>
			</div>
		</div>
	</Poptip>
</template>

<script lang="ts">
	import {Component, Vue, Emit, Prop, Watch} from 'vue-property-decorator';
	import {Chrome} from 'vue-color';
	import {Getter} from 'vuex-class';
	import {Utils} from '@components/canvas/Utils';
	import {Tools} from '@components/canvas/Tools';
	const namespace = 'stage';

	@Component({
		components: {'color-picker': Chrome}
	})
	export default class LayersComponent extends Vue {
		@Getter('layers', {namespace}) layers: any;
		@Getter('activeLayer', {namespace}) active: any;

		@Prop() ratio: any;
		@Prop() background: any;
		color = '#fafafa';
		colors = Utils.getDefaultColor();
		palette = '#fafafa';
		visible = {
			layer: true,
			palette: false,
			background: true
		};
		firstTimeOpen = true;

		@Emit() stageBackground(color: string | null) {}
		@Emit() layerCreate() {}
		@Emit() layerChange(id: string) {}
		@Emit() layerDelete(id: string) {}
		@Emit() layerState(id: string) {}

		@Watch('background')
		onBackgroundChanged() {
			if (this.background !== 'transparent') {
				this.color = this.background;
				this.palette = this.background;
			}
		}

		/** 背景色 */
		get backgroundColor() {
			return this.visible.background ? this.palette : 'transparent';
		}

		/** 缩略图高 */
		get thumbHeight() {
			return {height: Math.ceil(100 / this.ratio) + 'px'};
		}

		/** 边框高 */
		get borderHeight() {
			return {height: Math.ceil(100 / this.ratio) + 16 + 'px'};
		}

		/** 打开弹窗时 */
		onPopperShow(): void {
			if (this.firstTimeOpen) {
				/** 首次打开 - 更新所有图层缩略图 */
				const stage = Tools.getStage();
				for (const i in stage.layers) {
					if (Object.prototype.hasOwnProperty.call(stage.layers, i)) {
						stage.layers[i].thumbnail();
					}
				}
				this.firstTimeOpen = false;
			} else {
				/** 再次打开 - 更新当前图层缩略图 */
				Tools.getLayer().thumbnail();
			}
		}

		/** 关闭弹窗时 */
		onPopperHide(): void {
			setTimeout(() => {
				this.visible.palette = false;
				this.visible.layer = true;
			}, 200);
		}

		/** 显示调色板 */
		setColorPalette(): void {
			this.visible.palette = !this.visible.palette;
			this.visible.layer = !this.visible.layer;
		}

		/** 显示/隐藏背景色 */
		visibleBackgroundColorOrNot(): void {
			this.visible.background = !this.visible.background;
			this.stageBackground(this.visible.background ? this.palette : null);
		}

		/** 自定义选择色 */
		updatePickerColor(color: any): void {
			this.color = color.hex;
			this.palette = color.hex;
			this.setBackgroundColor();
		}

		/** 设置背景色 */
		setBackgroundColor(): void {
			if (this.visible.background) {
				this.palette = this.color;
				this.stageBackground(this.palette);
			} else {
				this.$Message.warning({content: '背景颜色被隐藏（透明），效果无法展现，请显示后再修改', duration: 3});
			}
		}
	}
</script>
