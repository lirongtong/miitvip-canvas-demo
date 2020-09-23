<template>
	<div class="mi-canvas" id="mi-canvas-container">
		<div class="mi-canvas-content" id="mi-canvas-content"></div>
		<div class="mi-canvas-tools" id="mi-canvas-tools">
			<div class="mi-canvas-tools-items">
				<mi-drag :active="canvas.tool" @tool-select="toolSelect"></mi-drag>
				<mi-selection :active="canvas.tool" @tool-select="toolSelect"></mi-selection>
				<mi-brush :active="canvas.tool" :color="canvas.brush.color" :solid="canvas.brush.solid" :icon="canvas.brush.icon" @tool-select="brushSelect" @on-show="brushSelectOnShow"></mi-brush>
				<mi-palette :default-color="canvas.brush.color" @tool-select="colorSelect"></mi-palette>
				<mi-thickness :default-thickness="canvas.brush.thickness" :default-opacity="canvas.brush.opacity" :active="canvas.tool !== 'brush' ? canvas.tool : canvas.brush.name" @change-thickness="thicknessSelect"></mi-thickness>
				<mi-eraser :active="canvas.tool" :type="canvas.eraser" @tool-select="eraserSelect"></mi-eraser>
				<mi-text :active="canvas.tool" :color="canvas.brush.color" :opacity="canvas.brush.opacity" :thickness="canvas.brush.thickness" @tool-select="toolSelect"></mi-text>
				<mi-screenshot :active="canvas.tool" :type="canvas.screenshot" @tool-select="cropSelect"></mi-screenshot>
				<mi-forward></mi-forward>
				<mi-backward></mi-backward>
			</div>
		</div>
		<div class="mi-canvas-footer" id="mi-canvas-footer">
			<mi-stages :ratio="canvas.ratio" :checked="canvas.checked" @stage-create="stageCreate" @stage-change="stageChange" @stage-delete="stageDelete"></mi-stages>
			<mi-layers :ratio="canvas.ratio" :background="canvas.background" @stage-background="stageBackground" @layer-create="layerCreate" @layer-change="layerChange" @layer-delete="layerDelete" @layer-state="layerState"></mi-layers>
			<mi-screenfull elem="mi-canvas-body"></mi-screenfull>
		</div>
	</div>
</template>

<script lang="ts">
	import {Component, Vue} from 'vue-property-decorator';
	import {Getter, Mutation} from 'vuex-class';
	import {Stage, stages} from '@components/canvas/Stage';
	import {MiBrushData, Tools} from '@components/canvas/Tools';
	import {Layer} from '@components/canvas/Layer';
	import {Utils} from '@components/canvas/Utils';
	import MiStages from './Stages.vue';
	import MiLayers from './Layers.vue';
	import MiDrag from './Drag.vue';
	import MiSelection from './Selection.vue';
	import MiBrush from './Brush.vue';
	import MiPalette from './Palette.vue';
	import MiThickness from './Thickness.vue';
	import MiEraser from './Eraser.vue';
	import MiText from './Text.vue';
	import MiForward from './Forward.vue';
	import MiBackward from './Backward.vue';
	import MiScreenshot from './Screenshot.vue';
	import MiScreenfull from './Screenfull.vue';
	import {Screenshot} from '@components/canvas/tools/Screenshot';

	const selectors = {
		container: 'mi-canvas-container',
		content: 'mi-canvas-content',
		toolbox: 'mi-canvas-tools',
		stages: 'mi-canvas-stages-list',
		layers: 'mi-canvas-layers-list',
		layerMask: 'mi-canvas-layers-mask'
	};

	const namespace = 'stage';

	@Component({
		components: {
			MiStages, MiLayers, MiBrush, MiPalette,
			MiDrag, MiSelection, MiScreenshot, MiThickness,
			MiEraser, MiText, MiForward, MiBackward,
			MiScreenfull
		}
	})
	export default class IndexComponent extends Vue {

		@Getter('activeStage', {namespace}) activeStage: any;
		@Getter('activeLayer', {namespace}) activeLayer: any;
		@Mutation('SET_STAGES', {namespace}) setStages: any;
		@Mutation('SET_LAYERS', {namespace}) setLayers: any;
		@Mutation('SET_ACTIVE_STAGE', {namespace}) setActiveStage: any;
		@Mutation('SET_ACTIVE_LAYER', {namespace}) setActiveLayer: any;

		stage!: Stage;
		layer!: Layer;
		canvas = {
			ratio: 0,							// 宽高比
			active: -1,                         // 当前选中的画布
			lastIndex: 0,                       // 画布的索引值(用于切换画布, 索引恢复)
			background: '#fafafa',              // 背景色(图层背景色选择器中的颜色 - 用于画布切换时)
			brush: {                            // 笔刷属性
				name: 'marker',                 // 选中的笔刷类型(马克笔/圆形...)
				icon: 'pencil',                 // 显示的 ICON
				last: 'pencil',                 // 记录最后一次 ICON(便于复原)
				color: '#000000',               // 颜色
				thickness: 20,                  // 粗细
				opacity: 0.8,                   // 透明度
				solid: true                     // 是否为实心(针对方形/圆)
			},
			tool: 'drag',                       // 当前选中工具
			eraser: 'select',                   // 橡皮擦类型
			checked: [],                        // 画布选择列表
			screenshot: 'area',					// 截图类型(area: 区域 / screen: 屏幕)
		};

		/**
		 * 设置宽高比.
		 * @return void
		 */
		setRatio(): void {
			const elem = document.getElementById(selectors.content);
			if (elem) {
				const width = elem.offsetWidth,
					height = elem.offsetHeight;
				this.canvas.ratio = Math.round(width / height * 100) / 100;
			}
		}

		/**
		 * 实例化 Stage.
		 * @param init 是否初始化涂鸦内容.
		 * @param index 自定义索引
		 * @param reset 是否重置(删除已有的 Stage)
		 */
		stageCreate(
			init: boolean | Event = false,
			index?: number,
			reset?: boolean
		): void {
			/** 实例化 Stage */
			this.stage = new Stage({
				container: selectors.content,
				reset
			}, index);
			/** 创建图层 */
			this.layerCreate();
			/** 切换成选中 */
			this.stageChange(this.stage.id);
			this.setStages(this.stage.getStages());
			/** 初始化涂鸦内容 */
			if (init) this.init();
			/** 创建成功后滚动至底部 */
			this.$nextTick(() => {
				Utils.scrollToTop(selectors.stages, true)
			});
		}

		/**
		 * 切换画布.
		 * @param id
		 */
		stageChange(id?: string | number): void {
			id = id ?? Object.keys(stages)[0];
			if (id && id !== this.activeStage) {
				const stage = stages[id] ?? this.stage.getStage(id as number);
				this.setActiveStage(stage.id);
				/** 恢复切换前选中画布的索引值 */
				const elem = document.getElementById(this.stage.get().canvas.id);
				if (elem) elem.style.zIndex = this.canvas.lastIndex.toString();
				/** 更新选中 */
				this.stage = stage;
				Tools.setStage(stage);
				Tools.setLayer(stage.layer);
				/** 设置 index */
				const canvas = document.getElementById(stage.canvas.id);
				if (canvas) canvas.style.zIndex = '578';
				this.canvas.lastIndex = stage.index;
				/** 选中工具 */
				this.toolSelect();
				/** 设置图层 */
				this.setLayers(stage.layer.getLayers(stage));
				this.setActiveLayer(stage.layer.id);
			}
		}

		/**
		 * 删除画布.
		 * @param selection 删除选中
		 * @param force 是否强制删除
		 */
		stageDelete(
			selection: any[] | string,
			force = false
		): any {
			const canvas = Object.keys(stages);
			if (
				canvas.length <= 1 &&
				!force
			) {
				this.$Message.warning({
					content: '已经是最后一个了，不能再删除了',
					duration: 3
				});
				return;
			}
			if (Array.isArray(selection)) {
				if (selection.length <= 0) {
					this.$Message.warning({
						content: '请选择需要删除的画布',
						duration: 3
					});
					return;
				}
				if (
					selection.length === 1 &&
					selection[0] === this.activeStage
				) {
					this.$Message.warning({
						content: '不允许删除当前选中的画布',
						duration: 3
					});
				}
				/** 默认清除选中ID */
				if (!force) {
					for (let n = 0, len = selection.length; n < len; n++) {
						if (selection[n] === this.activeStage) {
							selection.splice(n, 1);
							break;
						}
					}
				}
			}
			/** 执行删除 */
			const ids = this.stage.delete(selection);
			this.setStages(this.stage.getStages());
			/** 清除相应的画布 */
			for (let i = 0, len = ids.length; i < len; i++) {
				const elem = document.getElementById(ids[i]);
				if (elem) (elem.parentNode as HTMLDivElement).removeChild(elem);
			}
			/** 复位 */
			this.canvas.checked = [];
		}

		/**
		 * 背景色.
		 * @param color
		 */
		stageBackground(color: string): void {
			this.canvas.background = color ?? 'transparent';
			this.stage.updateBackgroundColor(color);
		}

		/**
		 * 实例化 Layer.
		 * @param index
		 */
		layerCreate(index?: number): void {
			this.layer = new Layer(index);
			this.stage.add(this.layer);
			this.setLayers(this.layer.getLayers(this.stage));
			this.setActiveLayer(this.layer.id);
			this.layerMask(true);
			this.$nextTick(() => {
				Utils.scrollToTop(selectors.layers, true);
			});
		}

		/**
		 * 切换图层.
		 * @param id
		 */
		layerChange(id: string): void {
			if (id !== this.activeLayer) {
				this.toolSelectBefore();
				this.layerMask(true);
				const layer = this.stage.layers[id];
				if (layer) {
					this.setActiveLayer(id);
					this.layer = layer;
					Tools.setLayer(layer);
				}
			}
		}

		/**
		 * 删除图层.
		 * @param id
		 */
		layerDelete(id: string): void {
			if (Object.keys(this.stage.layers).length <= 1) {
				this.$Message.warning({
					content: '已经是最后一个了，不能再删除了',
					duration: 3
				});
			} else {
				setTimeout(() => {
					const active = this.layerActive(id);
					this.stage.remove(id);
					this.setLayers(this.stage.layer.getLayers(this.stage));
					if (active) {
						const layer = this.stage.layers[active];
						this.layer = layer;
						Tools.setLayer(layer);
					}
					this.stage.thumbnail();
				}, 0);
			}
		}

		/**
		 * 选中图层(删除选中后需要重新选择).
		 * @param id
		 * @return string | null
		 */
		layerActive(id: string): string | null {
			if (id === this.activeLayer) {
				const keys = Object.keys(this.stage.layers);
				let active = '';
				for (let i = 0, len = keys.length; i < len; i++) {
					if (keys[i] && keys[i] === id) {
						active = keys[i - 1] ?? (len > 1 ? keys[i + 1] : keys[i]);
						break;
					}
				}
				if (active) {
					this.setActiveLayer(active);
					return active;
				}
			}
			return null;
		}

		/**
		 * 图层状态(显示/隐藏).
		 * @param id
		 */
		layerState(id: string): void {
			const layer = this.stage.layers[id];
			if (layer) {
				if (id === this.activeLayer) {
					if (!this.layer.hidden) this.layerMask();
					else this.layerMask(true);
				}
				this.stage.state(id);
				this.setLayers(this.stage.layer.getLayers(this.stage));
				this.stage.thumbnail();
			}
		}

		/**
		 * 隐藏选中图层后不可操作.
		 * 增加 Mask 遮罩.
		 * @param remove 是否为移除操作.
		 */
		layerMask(remove?: boolean): void {
			if (remove) {
				const mask = document.getElementById(selectors.layerMask);
				if (mask) mask.remove();
			} else {
				const mask = document.createElement('div');
				mask.id = selectors.layerMask;
				mask.style.zIndex = '1000';
				mask.style.width = '100%';
				mask.style.height = 'calc(100vh - 70px)';
				mask.style.background = 'transparent';
				mask.style.position = 'absolute';
				mask.style.left = '0';
				mask.style.top = '0';
				mask.onclick = () => {
					this.$Message.destroy();
					this.$Message.warning('选中图层被隐藏，无法进行操作');
					return false;
				};
				document.body.appendChild(mask);
			}
		}

		/**
		 * 切换工具前的处理.
		 * @param name
		 * @return Promise|void
		 */
		toolSelectBefore(name?: string): Promise<any> | void {
			name = name ?? this.canvas.tool;
			if (name !== 'brush') this.canvas.brush.icon = 'pencil';
		}

		/**
		 * 工具选择.
		 * @param name
		 */
		toolSelect(name?: string): void {
			name = name ?? this.canvas.tool;
			this.toolSelectBefore(name);
			this.canvas.tool = name;
			if (name === 'brush') this.stage.setActiveTool(this.canvas.brush.name);
			else this.stage.setActiveTool(name);
			this.updateCursor();
		}

		/**
		 * 选择笔刷工具.
		 * @param tool
		 */
		brushSelect(tool: MiBrushData): void {
			if (
				this.canvas.brush.name !== tool.tool ||
				(
					tool.solid !== undefined &&
					this.canvas.brush.solid !== tool.solid
				)
			) {
				this.$set(this.canvas.brush, 'name', tool.tool);
				this.$set(this.canvas.brush, 'icon', tool.icon);
				this.$set(this.canvas.brush, 'last', tool.icon);
				this.stage.setActiveTool(tool.tool);
				if (tool.solid !== undefined) {
					this.$set(this.canvas.brush, 'solid', tool.solid);
					this.stage.setActiveToolAttrs({solid: this.canvas.brush.solid});
				}
				this.updateCursor();
			}
		}

		/**
		 * 笔刷弹窗展示时, 默认选中[马克笔].
		 * @return void
		 */
		brushSelectOnShow(): void {
			this.toolSelectBefore();
			this.canvas.tool = 'brush';
			if (this.canvas.brush.icon !== this.canvas.brush.last) {
				this.$set(this.canvas.brush, 'icon', this.canvas.brush.last);
			}
			this.stage.setActiveTool(this.canvas.brush.name);
			this.stage.setActiveToolAttrs({solid: this.canvas.brush.solid});
			this.updateCursor();
		}

		/**
		 * 颜色选择.
		 * @param color
		 */
		colorSelect(color: string): void {
			this.$set(this.canvas.brush, 'color', color);
			Tools.setAttrs({color});
			if (this.canvas.tool === 'brush') this.updateCursor();
		}

		/**
		 * 选择粗细/透明度.
		 * @param value
		 */
		thicknessSelect(value: number): void {
			if (value <= 1) {
				/** 透明度 */
				this.$set(this.canvas.brush, 'opacity', value);
				Tools.setAttrs({opacity: value});
			} else {
				/** 粗细 */
				this.$set(this.canvas.brush, 'thickness', value);
				Tools.setAttrs({thickness: value});
				if (this.canvas.tool === 'brush') this.updateCursor();
			}
		}

		/**
		 * 橡皮擦.
		 * @param type
		 */
		eraserSelect(type: string): void {
			this.toolSelect('eraser');
			this.$set(this.canvas, 'eraser', type);
			this.stage.setActiveToolAttrs({type});
			/** 清除屏幕 */
			if (type === 'clean') Tools.getLayer().clear();
		}

		/**
		 * 截图.
		 * @param type
		 */
		cropSelect(type: string): void {
			this.toolSelect('screenshot');
			this.$set(this.canvas, 'screenshot', type);
			this.stage.setActiveToolAttrs({type});
			if (type === 'screen') {
				/** 截屏后强制改为区域截图 */
				Screenshot.screenshot();
				this.stage.setActiveToolAttrs({type: 'area'});
			}
		}

		/**
		 * 更新光标.
		 * @return void
		 */
		updateCursor(): void {
			this.stage.cursor.update(this.canvas.tool, {
				thickness: this.canvas.brush.thickness,
				color: this.canvas.brush.color
			});
		}

		/**
		 * 清除所有白板.
		 * @param data
		 */
		clear(data?: any): void {
			const values = Object.values(stages);
			data = data ?? Object.keys(stages).map((val: string) => {
				return stages[val].index;
			});
			data.forEach((idx: string) => {
				const id = values[values.findIndex((v) => v.index === parseInt(idx))].id;
				this.stageDelete(id, true);
			});
		}

		/**
		 * 初始化涂鸦内容.
		 * @param clear 是否清除原有的画布.
		 */
		init(clear = false): void {
			if (clear) this.clear();
		}

		mounted() {
			this.setRatio();
			this.stageCreate();
		}
	}
</script>
