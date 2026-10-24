# 手机食材美术对照

`food-styles.html` 是微信内置浏览器可打开的 H5 试玩入口；正式游戏仍是 `index.html`。

- A 为透明位图精细手绘，B 为可编辑 SVG 暖色卡通。香肠、培根、肉丸、鸡蛋、红椒各一份。
- 顶部切换保留当前棋盘、选中项、投料和弹窗；“重置”恢复肉类已解锁的测试盘面。刷新也会重置测试盘面。
- 运行真实游戏交互。预览每个标签页使用独立 IndexedDB 和写锁，不读取正式游戏进度。
- Canvas 根据设备像素比绘制，最高 3 倍；50 格内可见主体最长边为 36，鸡蛋为 34。格子的点击和拖拽范围保持完整。
- 样板文件在 `public/food-styles/`，相对路径支持 GitHub Pages 子目录。A 的原始 PNG、提示词、B 的原始 SVG 和本地验收材料保留在忽略的 `art/food-styles/`。

## 构建与发布

运行 `npm test`、`npm run build`，将整个 `dist/` 发布到既有 GitHub Pages 的 `gh-pages` 分支。`dist/food-styles.html` 和 `dist/food-style-frame.html` 是 Vite 的独立入口，共享游戏代码。所有预览所需运行资源均已纳入源码仓库；构建不依赖私有母稿。

预览不注册离线缓存。正式游戏的 Service Worker 仅接管正式入口导航；对照页走网络，以免被替换成正式游戏。已经安装旧版离线缓存的设备，需要先在游戏内接受更新，再重新打开对照链接。

## 样板源文件

B 的运行时 SVG 本身保留可编辑路径。A 的五张 1254×1254 透明母稿导出为 256×256 无损 WebP；公开仓库仅包含运行图。两套运行配置均在 `public/food-styles/manifest.json`。

本地制作脚本 `scripts/package-food-style-art.mjs` 与 `scripts/check-food-style-art.mjs` 用于已有私有母稿的再打包和像素验收，不参与生产构建。原有旧蔬果和其余料理的资源保持现状；本次供用户先选择画风。
