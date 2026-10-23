# 双页面存档与串行操作验证

验证日期：2026-10-24（北京时间）。以下结果来自本地自动化；不等同于 iOS / Android 真机、离线安装或多窗口浏览器实测。

## 已执行命令

工作目录：`C:/Users/23815/Desktop/fgame/goose-lane`。

```powershell
npm test -- tests/persistence.test.ts tests/persistence-v2.test.ts tests/persistence-controller.test.ts tests/persistence-platform.test.ts tests/pwa.test.ts
npx tsc --noEmit
```

最近结果：5 个测试文件，82 项通过；TypeScript 检查通过。

| 文件 | 用例数 | 主要覆盖 |
| --- | ---: | --- |
| `tests/persistence.test.ts` | 33 | 严格 JSON/字段校验、双快照、损坏恢复、原子事务、配额失败、跨实例冲突、版本兼容 |
| `tests/persistence-v2.test.ts` | 8 | schema 0/1 → 2、逐 UID 守恒、满盘待领取、投料所有权、加工刷新、原始快照长期备份、建设解锁格存取 |
| `tests/persistence-controller.test.ts` | 21 | UI 提交边界、独立命令排队、UID/目标校验、写失败取消队列、导入/恢复/接管、更新排空与互斥 |
| `tests/persistence-platform.test.ts` | 11 | 单写者锁、StrictMode 重新挂载、BFCache 返回、七种声音、静音、后台暂停、高频限流 |
| `tests/pwa.test.ts` | 9 | 完整版本预缓存、离线导航、版本固定、显式更新、前一版本懒加载兼容、缓存数量上限 |

## 迁移保证

- 保留现有数据库名 `goose-lane-v1`，升级的是档案 schema/content，避免把旧进度留在另一个数据库中。
- schema 0 的 `muted` 偏好显式映射为音乐、音效开关；schema 1 仅接受内容版本 `1.0.0`。
- 旧棋盘 56 格逐件映射到 63 格；设备占位或未开放区的物品按固定空格顺序迁移。仓库保持原物品及顺序，放不下的物品保存在 `migrationInbox`，不截断、不换 ItemId。
- 测试包含完整 56 格 + 8 格仓库的成熟档，以及首日 42 格 + 满仓产生 4 件待领取的情况；对迁移前后全部物品的 UID 和 ItemId 排序后比较。
- 旧料理任务的编号、原配方、结束时间与产物保留；旧金币、声望、完成订单、店铺进度不折算、不重发。
- 旧数字教学节点显式映射；成熟档直接保留完成状态。新档锁区跟随建设节点，旧档仍跟随经营日。
- 首次迁移写入在同一 IndexedDB 事务中保存原始 envelope 到 `migration-v0` / `migration-v1`。该记录不会被普通 `current` / `previous` 轮换覆盖，原始导出包含对应记录。
- 新旧固定夹具分别为 `tests/persistence-v0.fixture.json`、`tests/persistence-v1.fixture.json`、`tests/persistence-v2.fixture.json`；原 v0 夹具未改动。

## 操作提交边界

`busy` 用于启动、导入、恢复和版本激活等互斥工作；普通游戏保存使用 `pendingCommands` / `pendingUids`，不锁整盘。

- 鼠标或触摸提交时捕获来源 UID、目标 UID/格子版本、厨具版本及任务编号；执行时重新核验，并保留手势本身传入的预期身份。
- 正在提交的同一物品不允许重复消费；订单和旧料理菜单也会预留实际待消耗的物品 UID。
- 不同物品的操作依序保存。只有存储提交成功后才发布权威状态、播放结算声音；失败保持之前的种子、体力、物品和金币。
- 任一持久化失败取消该提交链后续操作并明确提示。重试使用原权威状态，不偷偷消耗随机序列。
- `sessionEpoch` 仅在载入/导入/恢复/接管后增长。UI 据此重新恢复页面、选中对象与订单位置；普通命令不会重置现场。
- `applyUpdate(activate)` 立即阻止新命令，等待已有队列保存完毕后才激活 Service Worker。队列保存或激活失败时解除互斥；成功后保持互斥直到浏览器重载。

## 已验证的关键失败场景

1. 开机首写失败时不展示“保存成功”的游戏状态。
2. 两个写者对同一 revision 竞争，只有一个提交成功。
3. 当前快照损坏时恢复上一快照，同时保留损坏原档用于导出。
4. 较新 schema/content 不退回旧快照覆盖，明确要求新版程序。
5. 保存中对两个不同 UID 拖动，两次都成功；同 UID 二次提交被拒绝。
6. 两个不同物品同时拖向同一空格，第二次发现落点已变化并安全取消。
7. 连续生成中第一笔写入失败，后续生成/拖动取消，种子与体力不变。
8. 投料、加工中、完成待取三个时点都能序列化往返，待取产物仅能领取一次。
9. 完成建设后，新解锁格里的物品仍能保存和刷新恢复。
10. 更新等待时允许已入队操作完成，禁止新操作；写失败不激活新版本。

## 浏览器集成审查记录

已通过 controller 提供场景恢复 epoch 与安全更新接口，消费端由 `App` 接入。审查发现的生命周期问题已修复并增加自动化：

- BFCache 返回：`pagehide.persisted` 释放写锁后，`pageshow.persisted` 触发一次重载，重新获取会话并读取最新存档；普通导航不额外重载。
- 多窗口更新：Service Worker 保留当前和最近一个旧版本缓存；新 worker 接管之后，旧窗口的旧 JS/CSS 懒加载请求可从前一版本缓存获得。更早版本缓存会清理，其他 scope 的缓存保持不变。
- 尚需真实浏览器验证容量耗尽、离线首次加载、安装后跨版本升级，以及 iOS / Android 长时间后台恢复。连续跨两个以上版本仍未重载的窗口不属于两版本缓存兼容范围。

这些路径在本次纯逻辑/模拟 IndexedDB 测试中没有被当作实机通过结果。
