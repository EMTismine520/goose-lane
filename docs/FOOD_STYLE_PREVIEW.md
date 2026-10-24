# 手机食材美术对照

[独立微信 A／B 对照](https://emtismine520.github.io/goose-lane-art-preview/)是推荐的 H5 试玩入口；正式游戏仍在原 `/goose-lane/` 地址。

旧地址白屏时使用[恢复入口](https://emtismine520.github.io/goose-lane-art-preview/recover.html)，点击“修复并打开美术对照”。只解除旧游戏 worker 注册，不清除存档。

- A 为透明位图精细手绘，B 为可编辑 SVG 暖色卡通。香肠、培根、肉丸、鸡蛋、红椒各一份。
- 顶部切换保留当前棋盘、选中项、投料和弹窗；“重置”恢复肉类已解锁的测试盘面。刷新也会重置测试盘面。
- 运行真实游戏交互。预览每个标签页使用独立 IndexedDB 和写锁，不读取正式游戏进度。
- Canvas 根据设备像素比绘制，最高 3 倍；50 格内可见主体最长边为 36，鸡蛋为 34。格子的点击和拖拽范围保持完整。
- 样板文件在 `public/food-styles/`，相对路径支持 GitHub Pages 子目录。A 的原始 PNG、提示词、B 的原始 SVG 和本地验收材料保留在忽略的 `art/food-styles/`。

## 构建与发布

运行 `npm test`、`npm run build`，将整个 `dist/` 发布到既有 GitHub Pages 的 `gh-pages` 分支。`dist/food-styles.html` 和 `dist/food-style-frame.html` 是 Vite 的独立入口，共享游戏代码。所有预览所需运行资源均已纳入源码仓库；构建不依赖私有母稿。

之后运行 `npm run package:food-preview`，生成 `dist-preview/`，将其发布到 `EMTismine520/goose-lane-art-preview` 仓库的 `main` 分支，Pages 来源为该分支根目录。预览根入口复制自同一构建的 `food-styles.html`；同时包含 `recover.html`，不包含 Service Worker 或离线 manifest。源码和版本来源写入发布仓库 README。

独立预览不注册离线缓存，并且位于旧游戏 worker 范围之外。只改原地址的 worker 规则不能立即救回已经被旧 worker 拦截的白屏设备，因此使用独立恢复地址。相关缓存恢复测试和说明见 [PWA 说明](PWA.md)。

## 样板源文件

B 的运行时 SVG 本身保留可编辑路径。A 的五张 1254×1254 透明母稿导出为 256×256 无损 WebP；公开仓库仅包含运行图。两套运行配置均在 `public/food-styles/manifest.json`。

本地制作脚本 `scripts/package-food-style-art.mjs` 与 `scripts/check-food-style-art.mjs` 用于已有私有母稿的再打包和像素验收，不参与生产构建。原有旧蔬果和其余料理的资源保持现状；本次供用户先选择画风。
