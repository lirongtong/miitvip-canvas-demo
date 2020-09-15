<template>
	<div class="mi-canvas-screenfull">
		<Tooltip content="全屏" placement="top">
			<span class="mi-canvas-tools-icon">
				<i class="iconfont icon-full-screen-enter" v-if="!full" @click="screenfullQuitOrIn"></i>
				<i class="iconfont icon-full-screen-exit" v-if="full" @click="screenfullQuitOrIn"></i>
			</span>
		</Tooltip>
	</div>
</template>

<script lang="ts">
	import {Vue, Component, Prop} from 'vue-property-decorator';
	import screenfull from 'screenfull';

	@Component
	export default class ScreenfullComponent extends Vue {
		@Prop() elem: any;
		full = false;

		screenfullQuitOrIn(): void {
			if (screenfull.isEnabled) {
				const elem = document.getElementById(this.elem);
				if (elem) {
					this.full = !this.full;
					if (this.full) {
						screenfull.request(document.getElementById(this.elem) as HTMLDivElement);
						screenfull.on('error', (evt) => {
							this.$Message.error({
								content: '全屏失败，请刷新后再试',
								duration: 3
							});
						});
					} else screenfull.exit();
				} else {
					this.$Message.error({
						content: '未获取到要全屏的内容',
						duration: 3
					});
				}
			} else {
				this.$Message.error({
					content: '当前浏览器不支持全屏操作',
					duration: 3
				});
			}
		}
	}
</script>
