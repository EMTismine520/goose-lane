# Third-party notices / 第三方软件声明

核验日期：2026-10-23。以下版本、版权人和许可证均取自本工作区实际安装的 `node_modules` 文件，并与 `package.json` 的生产依赖及对应传递依赖核对。版本锁定信息以 `package-lock.json` 为准；没有用项目简介代替许可证正文。

## 生产依赖

| 软件 | 实际版本 | 许可证 | 包内版权声明 | 完整许可证副本 |
| --- | --- | --- | --- | --- |
| Phaser | 4.2.1 | MIT | Copyright (c) 2026 Richard Davey, Phaser Studio Inc. | [phaser-LICENSE.txt](licenses/phaser-LICENSE.txt) |
| React | 19.2.0 | MIT | Copyright (c) Meta Platforms, Inc. and affiliates. | [react-LICENSE.txt](licenses/react-LICENSE.txt) |
| React DOM | 19.2.0 | MIT | Copyright (c) Meta Platforms, Inc. and affiliates. | [react-dom-LICENSE.txt](licenses/react-dom-LICENSE.txt) |
| Lucide React | 0.468.0 | ISC | Lucide Contributors 2022；其中源于 Feather 的部分版权归 Cole Bemis 2013–2022，原文件注明 MIT | [lucide-react-LICENSE.txt](licenses/lucide-react-LICENSE.txt) |

Lucide 的包级许可证是 ISC。其完整正文包含 Feather 的来源与版权说明，本项目保留该说明，没有把整包归类成 MIT。

## 上述生产包的直接传递依赖

| 软件 | 实际版本 | 引入关系 | 许可证与版权人 | 完整许可证副本 |
| --- | --- | --- | --- | --- |
| EventEmitter3 | 5.0.4 | Phaser → eventemitter3 | MIT；Copyright (c) 2014 Arnout Kazemier | [eventemitter3-LICENSE.txt](licenses/eventemitter3-LICENSE.txt) |
| Scheduler | 0.27.0 | React DOM → scheduler | MIT；Copyright (c) Meta Platforms, Inc. and affiliates. | [scheduler-LICENSE.txt](licenses/scheduler-LICENSE.txt) |

React 和 Lucide React 未声明其他运行时直接依赖。Lucide 的 React peer dependency 由上表的 React 包满足。此清单不把仅用于构建和测试的开发依赖误列为运行时代码。

## Phaser 包内保留的第三方声明

Phaser 的 npm 包包含部分内嵌算法与物理引擎源码。除包级 MIT 正文外，另保留实际源码中的以下完整许可证块或原始来源声明：

| 组件 | 实际来源 | 声明 | 随项目保留的文本 |
| --- | --- | --- | --- |
| Earcut 2.2.4 | `phaser/src/geom/polygon/Earcut.js` | ISC；Copyright (c) 2016, Mapbox | [phaser-earcut-LICENSE.txt](licenses/phaser-earcut-LICENSE.txt) |
| Simplify | `phaser/src/geom/polygon/Simplify.js` | BSD 2-Clause 正文；Copyright (c) 2017, Vladimir Agafonkin | [phaser-simplify-LICENSE.txt](licenses/phaser-simplify-LICENSE.txt) |
| Matter.js 内嵌源码 | `phaser/src/physics/matter-js/lib/license.js` | MIT；Copyright (c) Liam Brummitt and contributors. | [phaser-matter-js-LICENSE.txt](licenses/phaser-matter-js-LICENSE.txt) |
| PSRD noise 派生函数 | `phaser/src/math/HashSimplex.js` | 原始注释注明来自 psrdnoise2/3.glsl，2021-12-02 版本；Copyright (c) 2021 Stefan Gustavson and Ian McEwan；MIT | [phaser-noise-NOTICE.txt](licenses/phaser-noise-NOTICE.txt)；MIT 正文另见 [phaser-LICENSE.txt](licenses/phaser-LICENSE.txt) |

Matter.js 声明来自所安装 Phaser 包内的源码；本项目没有另外安装一个 Matter.js npm 依赖，也不据此宣称当前游戏使用物理系统。

## 副本核验与交付

六个 npm 包的许可证文件和 Matter.js 许可证文件均通过文件复制保留原始字节，并对源文件和副本做 SHA-256 一致性检查。结果记录在 [copy-verification.json](licenses/copy-verification.json)。Earcut、Simplify 从对应源文件提取完整许可注释块；noise 文件保留包中实际提供的完整来源注释。

发布源码或构建包时，将本文件与 `licenses/` 目录一并保留；构建压缩可能移除普通源码注释，不能用“源包曾含版权信息”代替分发时保留这些文本。静态站点若只部署 `dist/`，构建流程应把该声明及许可证复制进部署目录。

游戏领域规则、内容表、界面及 SVG 角色由本项目实现。图像、音频和字体来源另见 [ASSETS.md](ASSETS.md)。本文件不将第三方软件许可证扩展到游戏素材，也没有把调研中出现的其他餐厅游戏源码或素材列为实际复用资产。
