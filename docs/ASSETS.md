# Goose Lane 原创美术

## 当前新增 B 组 SVG

38 项新增兽肉、禽肉、调料、料理和设备已统一为暖色卡通。全部母稿与运行 SVG 声明为 96×96，母稿与复现说明见 [B 组源码](../artwork/b/README.md)。运行资源位于 `public/assets/items/`、`public/assets/entities/`；共享展示配置为 `src/content/b-art.json`，来源与内容哈希为 `public/assets/b-art.json`。

使用 `npm run art:build`、`npm run art:check` 复现与验收。旧蔬果 SVG、人物和街景保留；以下位图来源记录继续适用于旧街景与旧图集。已替换的新增位图和 A 样板仅在本地归档。

## 来源与使用

本项目的两张最终位图使用 Codex 内置 `image_gen` 工具生成，2026-10-23 完成。不是从网络抓取的素材，无外部品牌、现成游戏角色或第三方素材包。未使用 CLI/API fallback。下面保留完整 prompt，便于未来延续一致风格。最终图已复制到项目，不依赖 Codex 用户目录。

| 最终文件 | 用途 | 格式 |
| --- | --- | --- |
| `public/assets/street.webp` | 临河美食老街主视觉 | WebP，1536 × 1024，459,270 bytes |
| `public/assets/foods.webp` | 64 个食物图标，8 × 8 图集 | WebP，1254 × 1254，透明 alpha，539,264 bytes |

生成原图保存在 `art-source/street.png` 与 `art-source/foods.png`，不进入 public 构建目录。最终分发图用 Sharp 进行格式压缩（WebP quality 86、alphaQuality 100、effort 6），未裁切、重绘、缩放或改动构图。两张分发图合计 998,534 bytes，原始透明通道得到保留。

图集按从左到右、从上到下零起算，`ItemDef.icon` 对应格号。行序为小麦烘焙、咖啡、蔬菜、奶品、水果、海鲜、肉类、甜点。每行前七格为食材链，第八格为成品料理。Phaser 从图片实际宽高各除以 8 建立帧，React 缩略图使用 800% 背景与 `column / 7 * 100%` / `row / 7 * 100%` 位置。

## 街景生成 prompt

```text
Use case: illustration-story
Asset type: final panoramic illustration for a premium original cozy food-merge browser game called Goose Lane.
Primary request: a beautiful hand-painted Chinese riverside food street in spring. A tiny original white goose shopkeeper wearing a muted red apron waves beside a breakfast bakery; a welcoming coffee shop and colorful produce stall make a small intimate neighborhood.
Style/medium: polished storybook gouache and colored pencil, rich hand-painted texture with elegant clean shapes, original cozy indie-game art.
Composition/framing: landscape 3:2, establish the full charming street with the three shopfronts in the middle horizontal band, slight overhead oblique view, lush spring trees framing both sides, calm canal along bottom, small stone bridge and bicycles, layered rooftops behind. Detailed but clearly readable at small banner size. No large blank areas.
Lighting/mood: warm morning sunlight, friendly and quietly magical, inviting place with stories.
Color palette: warm cream plaster, celadon and sage green, brick red shutters and terracotta roofs, pale turquoise water, restrained golden yellow accents.
Constraints: no text anywhere, no writing, no lettering, no logos, no watermark, no UI, no border. No existing characters or recognizable brand. High quality finished game key art.
```

第一张结果角落出现非预期小签名，使用同一内置工具做局部修正。最终生成文件：`exec-e65e5091-632d-45d3-bf72-bd28903d1e91.png`，原始生成目录 `C:/Users/23815/.codex/generated_images/01a1695a-fe71-7e42-a215-ff29d5d9abb4/`。

修正 prompt：

```text
Use case: precise-object-edit. This is the final panoramic key art for Goose Lane. Keep absolutely every aspect of this image unchanged: the original goose, all shops, all architecture, trees, canal, colors and composition. Only remove the tiny light handwritten signature in the extreme lower-left corner, replacing it with natural matching water and shadow texture. There must be no writing, signature, text, watermark or logo anywhere. Preserve landscape 3:2 and image quality.
```

## 食物图集生成 prompt

使用 `transparent_background: true`。

```text
Use case: stylized-concept
Asset type: production-ready square food sprite atlas for an original cozy hand-painted cooking game.
Primary request: exactly 64 separate illustrated food icons in an EXACT uniform 8-column by 8-row grid on a genuinely transparent background. Each icon is centered inside its own equal-sized square cell; no icon crosses cell boundaries; every cell has 20% empty padding. All 64 icons the same visual scale and consistent perspective, soft gouache hand-painted with crisp rich outlines, warm cream/sage/terracotta cozy game palette. No cast shadow outside icon. No surrounding panel.
Rows must be this precise order, left to right:
ROW 1 baking: wheat sprig; small flour sack; dough ball; butter toast slice; golden croissant; round rustic bread loaf; woven bread basket; plate of French toast.
ROW 2 coffee: coffee bean; small coffee beans sack; ground coffee in bowl; black espresso cup; white milk coffee cup; latte in ceramic cup; elegant pour-over glass coffee server; plate of coffee tiramisu.
ROW 3 vegetables: seedling; carrot; tomato; leafy greens; vegetable basket; chopped vegetables in bowl; prepared salad in bowl; vegetable soup in ceramic pot.
ROW 4 dairy: small milk bottle; tall milk bottle; milk carton; yogurt jar; butter block; cheese wedge; wheel of cheese; creamy pudding in a glass.
ROW 5 fruit: strawberry; orange; apple; bunch of grapes; mixed fruit basket; sliced fruits on plate; fruit parfait glass; plate of fruit tart.
ROW 6 seafood: tiny shrimp; prawn; small blue fish; whole silver fish; salmon fillet; crab; lobster; bowl of seafood noodles.
ROW 7 meat: small ham slice; sausage; bacon strips; raw steak; roast chicken; large roast ham; plated grilled steak; bowl of braised beef with rice.
ROW 8 desserts: sugar cubes; wrapped candy; cookie; cupcake; chocolate brownie; round cake; elegant strawberry layer cake; plate of matcha roll cake.
Composition: exact 8 by 8 regular matrix, 64 cells, edge-to-edge grid positions, no row labels, no column labels, no grid lines, no borders, no text, no numbers, no checkerboard painted in. Each distinct icon completely isolated on transparent alpha. Production art, carefully centered and consistently spaced.
```

为改善格子边缘留白，使用内置工具保持透明度做一次排布修正。最终生成文件：`exec-cc628545-b368-4308-aa7d-ec9df27726c6.png`。

修正 prompt：

```text
Use case: precise-object-edit. This transparent food atlas is almost ready. Keep all 64 existing food illustrations, their exact order, exact 8 rows and 8 columns, style and colors. Make exactly one change: normalize all icon positions and sizes onto a precise uniform square 8x8 sprite grid. Each icon must be fully contained within the CENTRAL 64% of its cell, with at least 18% of cell width as transparent padding on each side and at least 18% cell height padding above and below. Center each icon exactly at each cell center. Reduce oversized icons to fit; no overlap; do not let a lobster claw, baguette, leaf, plate or fish tail cross any cell boundary. The atlas must fill a square canvas, exactly 8 equal rows and 8 equal columns. Background stays genuinely transparent, no checkerboard drawn, no text, no lines, no border. Maintain crisp high-quality artwork.
```

## 验收与后续修改

最终图逐张视觉检查：街景没有残留签名；图集包含 64 个图标，行列顺序稳定且透明；棋盘没有用 emoji 替代食物。锁头、等级标和短暂的合成粒子由 Phaser 几何图形绘制，属于界面元素。食物图集通过其天然透明边界融入奶油色棋盘。图像生成对图集排布不是像素级保证，新增图标时需要查看真实游戏格子的裁切效果。

需要改动现有位图时，用内置 image_gen 编辑；若重新生成系列图，应保持上述配色、笔触与透视，并重新验收各级图标和料理内容。保留透明 alpha，不把棋盘背景烘焙进图集。

