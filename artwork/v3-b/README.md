# V4 精致暖色卡通：完整图鉴美术

现行集合共 **323 项**：122 个合成节点、123 个配方成品、78 个器材等级外观。26 类器材包含 14 类单链生产器和 12 类厨具，每类都有三级外观。

目录名 v3-b、运行路径 assets/v3-b 与既有命令别名沿用；内容与美术版本为 4.0.0。运行时统一读取完整图鉴映射，旧 B 图不再优先。

## 画法与识别

- 96 单位原生 SVG；暖棕描边、上左光源、材质分层。木材、冷鲜金属、玻璃、陶瓷和食物使用各自的渐变及反光方式。
- 器材的外轮廓和主体特征分别设计。兽肉使用横向冷鲜柜，禽肉使用圆拱蛋筐架；咖啡为豆仓磨机，茶为掀盖茶罐。
- 三级成长保留类别身份，增加功能结构；避免换色或堆小图标代替升级。
- 食物通过形状、切面、容器与内容物共同区分。肉类、乳品、谷物、咖啡与茶的重点混淆组有专门绘制；十款果饮与奶茶另有独立杯型。
- 食物曲线可在生产器展示和料理构图中共享，保持同一食材的视觉身份；不嵌入外部位图或研究裁切。

核心绘制模块：primitives.mjs、subjects.mjs、materials.mjs、devices.mjs、opening-recipes.mjs、finished-drinks.mjs、recipes.mjs。draw-masters.mjs 从内容定义生成全量母稿与清单。

## 文件与复现

- masters/：323 份可编辑 SVG 母稿。
- runtime/：仅调整运行视口的等形 SVG。
- ../../art/v3-b/masters/：512×512 透明 PNG 导出。
- ../../public/assets/v3-b/：256×256 无损透明 WebP。
- ../../public/assets/mobile/：128×128 无损透明 WebP，文件名带内容哈希。
- catalog.json、manifest.json、presentation.json：身份、版本、源/运行哈希及可见尺寸。
- overview.html 与 ../../public/art-v4.html：搜索、类别、等级、32/40/48/96 像素、灰度、剪影及隐藏名称审查。
- qa/contact-*.png：全量与分类联系表。

在项目根目录顺序运行：

    npm run art:build:v4
    npm run art:build:mobile
    npm run art:check:v4
    npm run art:check:mobile
    npm run art:review:v4

独立代表样稿：

    node artwork/v3-b/draw-masters.mjs --sample

审查图位于 output/v4-art-upgrade/review/。七组内容在四种尺寸、三种颜色模式下生成 84 张对照板；recognition-test.csv 是空白真人识别记录，不是已完成的测试。

## 显示与预算

以 50×50 设计格计，鸡蛋可见最长边 34、其他食材 36、料理 38、器材 42；误差不得超过 0.75 设计像素。显示占格和纹理采样分别控制，不能因高分辨率改变拖动坐标。

移动图总量上限 2.25 MiB、256 图上限 8 MiB。128 图采用 WebP lossless、quality=100、effort=6；quality 在无损模式下用于编码压缩选择，不降低已生成的像素质量。

## 历史与验收

V3 源稿、运行图和清单已归档至项目外 art-archive/v3-before-v4-20261028/art-and-content.zip。V3 的旧 calibration 图单独移入同一归档目录，不作为 V4 验收证据。

自动检查覆盖身份、数量、唯一哈希、SVG 定义、透明边界、尺寸和预算。灰度/剪影对照及桌面浏览器检查不能替代三名试玩者识别或 Android/iPhone 微信真机验收。当前具体状态见 ../../docs/V4_DELIVERY.md。
