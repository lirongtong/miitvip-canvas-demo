<template>
	<Poptip trigger="click"
			popper-class="mi-canvas-stages"
			placement="top"
			@on-popper-show="onPopperShow"
			transfer>
			<span class="mi-canvas-tools-icon">
				<i class="iconfont icon-add-file"></i>
			</span>
		<div slot="content">
			<div class="mi-canvas-stages-title">
				<span>画布管理</span>
				<div class="mi-canvas-stages-title-btns">
					<Tooltip content="添加画布" placement="top">
						<i class="iconfont icon-add" @click="stageCreate"></i>
					</Tooltip>
				</div>
			</div>
			<div class="mi-canvas-stages-wrapper">
				<div class="mi-canvas-stages-list" id="mi-canvas-stages-list">
					<CheckboxGroup v-model="selected" size="large">
						<div class="mi-canvas-stages-list-item" v-for="stage in stages" :key="stage.id" :class="active === stage.id ? 'active' : null">
							<div class="mi-canvas-stages-list-btns" :style="borderHeight"></div>
							<div class="mi-canvas-stages-list-thumbnail-bg" :style="thumbHeight">
								<Checkbox :label="stage.id" :disabled="active === stage.id"></Checkbox>
								<div class="mi-canvas-stages-list-thumbnail" @click="stageChange(stage.id)" :id="stage.id"></div>
							</div>
						</div>
					</CheckboxGroup>
				</div>
			</div>
			<div class="mi-canvas-stages-btns">
				<span @click="stageDelete(selected)">
					<i class="iconfont icon-delete"></i>删除白板
				</span>
			</div>
		</div>
	</Poptip>
</template>

<script lang="ts">
	import {Component, Emit, Prop, Vue, Watch} from 'vue-property-decorator';
	import {Getter} from 'vuex-class';
	import {stages} from '@components/canvas/Stage';
	import {Tools} from '@components/canvas/Tools';
	const namespace = 'stage';

	@Component
	export default class StagesComponent extends Vue {

		selected: any[] = [];
		firstTimeOpen = true;

		@Prop() checked: any;
		@Prop() ratio: any;

		@Getter('stages', {namespace}) stages: any;
		@Getter('activeStage', {namespace}) active: any;

		@Emit() stageCreate() {}
		@Emit() stageChange(id: string) {}
		@Emit() stageDelete(selection: any[]) {}

		@Watch('checked')
		onCheckedChanged() {
			this.selected = this.checked;
		}

		/** 缩略图高 */
		get thumbHeight() {
			return {height: Math.ceil(200 / this.ratio) + 'px'};
		}

		/** 边框高 */
		get borderHeight() {
			return {height: Math.ceil(200 / this.ratio) + 16 + 'px'};
		}

		/** 打开弹窗 */
		onPopperShow() {
			if (this.firstTimeOpen) {
				/** 首次打开 - 更新所有画布缩略图 */
				for (const i in stages) {
					if (Object.prototype.hasOwnProperty.call(stages, i)) {
						stages[i].thumbnail();
					}
				}
				this.firstTimeOpen = false;
			} else {
				/** 再次打开 - 更新当前画布缩略图 */
				Tools.getStage().thumbnail();
			}
		}
	}
</script>
