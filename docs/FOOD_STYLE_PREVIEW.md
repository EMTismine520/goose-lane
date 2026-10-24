# B 组暖色卡通试玩

[独立 B 组试玩](https://emtismine520.github.io/goose-lane-art-preview/)展示全部 34 项食材与料理、4 个新增设备，另有旧蔬果和重复食材，支持真实合成、交换、烹饪与交单。[正式游戏](https://emtismine520.github.io/goose-lane/)使用完全相同的 B 默认资源。

“重置”与刷新会恢复试玩盘面。每个标签页使用独立测试数据库与写锁，正式游戏和手动存档不受影响。旧的 `style=painted`、`style=cartoon` 链接与风格消息均显示 B；页面没有 A 切换入口。

旧游戏白屏时打开[B 组直达入口](https://emtismine520.github.io/goose-lane-art-preview/recover.html)，页面会自动进入 B 组独立试玩，无需点击修复。该入口不读取旧存档，也不等待旧离线程序；试玩直接使用独立测试盘面。

## 美术与尺寸

- 全部 38 项 SVG 母稿在受版本控制的 [artwork/b/masters](../artwork/b/masters)，源码为真实路径、描边与渐变。
- 文件声明统一为 96×96。运行版只调整方形 viewBox 留白，保留母稿路径。
- 以 50×50 棋盘设计格计，鸡蛋可见最长边 34、其他食材 36、料理 38、设备 42，容差 0.7。
- 显示框包含透明留白，由共享展示配置决定。DPR 只提高采样精度，不改变主体大小或输入坐标。
- 实际资源在 `public/assets/items` 与 `public/assets/entities`，来源、哈希与展示配置见 `public/assets/b-art.json`。
- A 与旧 PNG/WebP 母稿仅保留在本地归档，当前源码、构建及试玩不再提供 A。

## 从公开源码复现

```powershell
npm ci --registry=https://registry.npmjs.org
npm run art:build
npm run art:check
npm test
npm run build
npm run package:food-preview
```

Sharp 固定为 0.35.5，无需助手机器私有模块或 PNG 母稿。美术生成是确定性的；重复运行应无差异。

`dist/` 发布到正式仓库的 `gh-pages`；`dist-preview/` 发布到试玩仓库的 `main`。两个包使用同一源码提交，`release.json` 记录 SHA。试玩不包含 service worker 或离线 manifest。

## 验收入口

本地打开 `food-styles.html`。验收参数 `renderer=canvas|auto`、`dpr=1|2|3` 控制渲染模式与画布倍率。360×640、390×844、430×900 均需检查完整盘面、角标与设备状态。

直接打开 `food-style-frame.html?layout=sausages&renderer=canvas&dpr=3` 可检查重复香肠满盘；该盘面仍使用独立测试存档，合成后会正常空出格子。

桌面浏览器、模拟尺寸及 HTTP 文件校验与微信真机结果分别记录。桌面检查通过不代表微信真机已通过。
