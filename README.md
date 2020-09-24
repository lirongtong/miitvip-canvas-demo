# 涂鸦白板 - 麦可易特网
> 当前开源代码为 Demo 版本，且为单机版的。UI 设计的相对简单，功能不尽完善，仅将做好的部分工具开源出来了，后续另有相对比较成熟的版本，集成了会议 / 文档 / 实时同步 / 在线聊天 / 用户管理等功能，重新设计了 UI，后续将提供体验地址。

> Demo 体验地址：[https://canvas.makeit.vip/](https://canvas.makeit.vip/)

## 初始化
```
const stage = new Stage({container: `canvas's container id`});
const layer = new Layer();
stage.add(layer);

初始化 Stage 时, 需要手动初始化一个图层, 将该图层添加至当前 Stage, 
完成初始化操作后, 所有的绘制动作都将在当前图层内操作.
Stage 内可无限添加画板(Canvas), 同时也支持每个 Canvas 内无限添加图层(Layer).
```

## 目录结构
```
src                 
 ├─assets                   静态资源    
 │  ├─fonts                 字体(iconfont)
 │  ├─images                图片资源
 │  └─styles                样式资源
 │      └─canvas            组件样式
 ├─components               组件模块
 │  └─canvas                画板
 │      ├─shapes            图形工具类
 │      ├─tools             画板工具类
 │      └─workers           多线程任务
 ├─router                   路由管理
 ├─store                    状态管理
 │  └─stage                 Stage 状态
 ├─utils                    通用工具类
 └─views                    视图
    └─canvas                Canvas 视图
```

## 画板组件
```
canvas
 ├─Base.ts                  基类
 ├─Canvas.ts                画板类
 ├─Cursor.ts                光标类
 ├─Events.ts                事件类
 ├─Layer.ts                 图层类
 ├─Point.ts                 坐标类
 ├─Shape.ts                 图形类
 ├─Stage.ts                 中心类
 ├─Throttle.ts              节流类
 ├─Tools.ts                 笔刷类
 ├─Utils.ts                 工具类
 ├─...                      其它基础/工具类 ...
 ├─shapes                   
 │  ├─Arc.ts                圆形类
 │  ├─Rect.ts               矩形类
 │  └─...                   更多工具...    
 ├─tools               
 │  ├─Arrow.ts              箭头
 │  ├─Circular.ts           圆形
 │  ├─Drag.ts               拖拽
 │  ├─Eraser.ts             橡皮擦
 │  ├─Laser.ts              激光笔
 │  ├─Line.ts               直线
 │  ├─Pencil.ts             马克笔
 │  ├─Rect.ts               矩形
 │  ├─Screenshot.ts         截屏
 │  ├─Selection.ts          选择
 │  ├─Text.ts               文本 
 │  └─...                   更多工具实现类
 └─workers             
 │  ├─rect.worker.ts        矩形任务处理
 |  ├─points.worker.ts      坐标任务处理
 |  └─socket.worker.ts      Socket 任务处理
```

## 视图文件
```
views
 ├─Backward.vue             回撤
 ├─Brush.vue                笔刷工具
 ├─Document.vue             文档管理
 ├─Drag.vue                 拖动画布(无限画布)
 ├─Eraser.vue               橡皮擦
 ├─Forward.vue              恢复
 ├─Import.vue               导入文档
 ├─Index.vue                页面入口
 ├─Layers.vue               图层管理
 ├─Palette.vue              调色板
 ├─Screenfull.vue           全屏
 ├─Screenshot.vue           截屏
 ├─Selection.vue            选择
 ├─Stages.vue               画布管理
 ├─Text.vue                 文本功能
 ├─Thickness.vue            笔刷粗细
 └─Users.vue                用户管理
```

## 工具开发
```
1. 新建工具类(src/components/canvas/tools)
2. 工具类继承 Tools 基类及其实现 MiTools
3. 调用 Stage.register(tool) 进行注册或在 Stage.registerTools() 方法中内置
```

## 常用命令
```
npm install                 项目设置(安装依赖)
npm run serve               本地运行
npm run build:dev           项目构建(development)
npm run build:pro           项目构建(production)
npm run test:unit           单元测试
npm run lint                语法检测
```
