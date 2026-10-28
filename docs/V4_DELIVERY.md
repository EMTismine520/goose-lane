# 鹅巷食光 V4 本地交付与验收

日期：2026-10-28。依据工作区 docs/plan/planv4.md 实施。代码、美术及本地生产构建已完成；三人识别与微信真机验收尚未完成。正式线上版本与来源提交以[站点 release.json](https://emtismine520.github.io/goose-lane/release.json)为准。

## 可直接查看

- [本地游戏](http://127.0.0.1:4184/)
- [V4 美术审查页](http://127.0.0.1:4184/art-v4.html)：类别、等级、32/40/48/96 像素、灰度、剪影及隐藏名称。
- [器材轮廓对照](../output/v4-art-upgrade/review/equipment-96-color.png)
- [果饮奶茶专项](../output/v4-art-upgrade/review/finished-drinks-96-color.png)
- [完整图鉴及配方](V3_CATALOG.md)。目录名称为历史名称，现行内容版本为 4.0.0。

本地预览进程使用 4184 端口。关闭后可在项目根目录运行：

    npm run preview -- --port 4184 --strictPort

## 完成的行为与美术

| 内容 | V4 |
|---|---:|
| 食材合成链 | 14 |
| 单链生产器 / 厨具 | 14 / 12 |
| 器材等级外观 | 78 |
| 食物图标 | 245 |
| 图鉴条目 | 323 |
| 配方 / 成品 / 主线订单 | 123 / 139 / 145 |

蔬菜与时蔬、鲜果与风味鲜果、咖啡与茶及特调基底分别使用专用器材。新增时蔬菜架、风味果筐、茶叶罐、特调基底柜；咖啡豆磨机取代共享饮品冰柜。每类生产器只对应一条合成链，命令层拒绝跨链生产和配置。链内产出段、体力费用、等级门槛及合成规则保留。

对应主题首次赠送一级器材，后续主题器材放入设备架；副本 40 金币，两台同类同级合成。棋盘保持 7×9 和两主页面，点击生产／开火／领取与拖动移动／交换／合成／投料的规则保留。

323 项均由 V4 原生 SVG 绘制系统生成。兽肉、禽肉、咖啡、茶及其余器材分别设计主体轮廓；原有 308 个保留身份的图标均有新的运行哈希，另有 15 个新器材等级身份，退出原饮品冰柜三级身份。食物通过轮廓、切面、容器和内容物区分，十款果饮与奶茶进一步拆分杯型。图形在棋盘、订单、仓库、设备架、图鉴、详情和存档缩略图共享。

V4 使用 goose-lane-v4 数据库及 V4 写锁、跨窗口通信作用域。首次进入新档，不自动读取或清除旧库。新档保留 current/previous、三个手动槽位和导入导出；导入仅接受 V4。存档结构保持 schema 3，内容和发行版本为 4.0.0。

## 验证结果与证据

| 检查 | 结果 | 证据 |
|---|---|---|
| 全量单元与集成测试 | PASS，401 项，0 失败 | output/v4-art-upgrade/tests.json |
| 全流程模拟 | PASS，三个既有种子均完成 145 订单、123 配方、245 食物与 78 器材发现 | src/diagnostics/v3-results.json |
| 自然资源可达性 | PASS，不注入目标物品或金币，goldFarmed=0，峰值占格 49/62/63 | 同上 |
| 美术完整性 | PASS，323 唯一哈希，透明边界与尺寸通过 | npm run art:check:v4 |
| 美术复现 | PASS，重新生成 1298 个文件，哈希差异 0 | output/v4-art-upgrade/reproduction.json |
| 手机尺寸与棋盘采样 | PASS，18/18 | output/v4-art-upgrade/browser/matrix.json |
| 界面操作 | PASS，15 项 | output/v4-art-upgrade/browser/interactions.json |
| 正式本地入口 | PASS，V4、60 体力、0 金币的新档，日志无错误 | output/v4-art-upgrade/browser/direct-game-smoke.json |
| 生产构建与预算 | PASS | dist/performance-budget.json、dist/offline-budget.json |
| Git 差异空白检查 | PASS | git diff --check |
| 三名试玩者识别 | PENDING，尚无真人记录 | output/v4-art-upgrade/review/recognition-test.csv |
| Android / iPhone 微信 | PENDING，未实测 | output/v4-art-upgrade/review/review-index.json |

18 组为 360×640、390×844、430×900 × Canvas/WebGL × 棋盘采样 1/2/3。使用项目已有的棋盘采样覆盖接口，不等于改变真实屏幕 DPR，也不等于手机真机。

界面操作涵盖礼包、咖啡购买及升级、产出段与预览、咖啡和茶分别生产、三个手动槽位、重开与读档、点击只选中、拖动合成／移动／交换、存入取回、交单、图鉴来源、拖动投料、开火领取及双页切换。最后的饮品细化只改变十张成品美术；最终构建另外重跑全量测试与 18 组渲染矩阵。

组合式 v3-preview.html 在当前内置浏览器的检查环境中出现 MutationObserver 的非 Node 参数日志；给父子页面加入临时 error 捕获均未捕获到页面错误，直接游戏入口无该日志。归属尚未完全确认，组合预览的控制台验收记为 WARN，未记为清洁通过。临时诊断页面已从最终构建移除。交付使用上方直接游戏和美术审查入口。

预算为构建时参考值，不是手机网络与帧率实测：

| 项目 | 实际 | 上限 |
|---|---:|---:|
| 323 张 128 图 | 2,348,330 字节 / 2.24 MiB | 2.25 MiB |
| 323 张 256 图 | 7,026,016 字节 / 6.70 MiB | 8 MiB |
| 开局资源参考 | 638,119 字节 / 623 KiB | 1 MiB |
| 后期资源参考 | 799,115 字节 / 780 KiB | 1.5 MiB |
| 核心预缓存 | 2,464,037 字节 / 2.35 MiB | 5 MiB |
| 完整离线资源 | 13,954,022 字节 / 13.31 MiB | 16 MiB |

## 源稿、制作与交付包

- artwork/v3-b/masters/：323 份可编辑 96 单位 SVG。
- art/v3-b/masters/：323 份 512×512 透明 PNG。
- public/assets/v3-b/：256×256 无损透明 WebP。
- public/assets/mobile/：128×128 无损透明 WebP，内容哈希命名。
- artwork/v3-b/README.md：绘制模块、显示参数和复现说明。
- output/v4-art-upgrade/review/：84 张分类、尺寸、灰度与剪影对照板，以及 78 个等级外观的空白真人识别表。
- output/v4-art-upgrade/browser/：矩阵、操作记录与实际浏览器截图。
- output/v4-art-upgrade/goose-lane-v4-artwork.zip：源稿、导出图、制作脚本及清单。
- output/v4-art-upgrade/goose-lane-v4-web.zip：完整静态生产构建。
- output/v4-art-upgrade/delivery-files.json：交付 ZIP 大小与 SHA-256。

制作与验证顺序：

    npm ci
    npm run art:build:v4
    npm run art:build:mobile
    npm run art:check:v4
    npm run art:review:v4
    npm run simulate:v4
    npm test
    npm run build

部分路径及命令保留 v3 名称以减少无关迁移；内容按 V4 清单计算，不依赖原来的 311/66 常量。旧 B 制作入口仍保留为历史基线，现行图优先使用完整图鉴映射。

V3 美术和内容归档位于项目外 ../art-archive/v3-before-v4-20261028/art-and-content.zip，SHA-256：
A59CD4986437ECDE4EFF23E8BA2008FF03FEB3716CBAD2B01F6D7985B3A3F124。

## 尚待完成

三位未参与制作的试玩者需要完成识别记录，目标总体正确率至少 90%，兽肉／禽肉和咖啡／茶两组全部辨认正确；Android 与 iPhone 的微信需要检查清晰度、触控及连续游玩。空白记录已经提供，不能用 Codex 自检或自动模拟代填。

初次本地验收包的 release.json 标记 sourceDirty=true。正式发布从已提交且工作区干净的源码重建，release.json 记录对应源码 SHA 和 sourceDirty=false；部署后另外核对 Pages 构建状态及线上资源哈希。三人识别与微信真机验收仍需独立完成。
