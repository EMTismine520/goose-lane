# 离线运行与版本更新

生产构建执行 `npm run build`，Vite 完成后运行 `scripts/build-sw.mjs`。脚本扫描 `dist` 内的 HTML、CSS、JavaScript、图片、图标与 manifest，按文件路径和内容 SHA-256 生成版本化 `sw.js`；Source Map 与 worker 自身不进入缓存。总资源超过 5 MiB 时构建失败，以维持初次缓存的体积预算。两个原创美术资源已经压缩为 WebP，源 PNG 不进入生产包。

`src/platform/pwa.ts` 的 `registerPwa(onUpdate, onError?)` 只在生产构建注册。开发服务器不会注册 worker，以免开发代码被缓存。部署需要 HTTPS（本机 localhost 是浏览器允许的例外），静态服务要正确提供 `sw.js` JavaScript MIME 类型。项目使用相对 base，注册、manifest 与缓存范围会跟随实际安装子目录。

## 接入

页面入口加入 `./manifest.webmanifest` 的 manifest link，以及 `./app-icon-180.png` 的 apple-touch-icon link。应用挂载时调用 `registerPwa`，卸载时调用它返回的清理函数。

`onUpdate` 收到一个 `activate: () => Promise<void>` 函数。此时仅显示“新版本可用”；用户确认并且当前没有进行中的游戏命令、存档已经完成后，才调用 `activate()`。函数向 waiting worker 发送 `SKIP_WAITING`，收到 `controllerchange` 后刷新当前页面。函数会报告超时错误；UI 应保留重试入口。初次安装不会自动刷新页面。其他已打开的标签页不会因本标签页点击更新而被应用代码强制刷新。

## 一致性与失败处理

- 安装使用 `Cache.addAll` 原子写入一整版资源，并为每个请求附内容完整性校验。下载不完整时删除本次缓存，旧 worker 与旧缓存继续工作。
- 新 worker 不自行 `skipWaiting`。用户未确认时，当前页面与离线资源保持旧版；所有页面都关闭后，由浏览器按标准生命周期自然激活新 worker。
- 导航先尝试网络，并校验返回 HTML 属于当前缓存版本。部署新版后，只要旧版 `index.html` 仍在，worker 继续返回本版 HTML，直到新 worker 激活。浏览器若已移除该 HTML，则直接使用成功的网络响应恢复加载，不再让版本校验把有效的新页面拒绝成白屏；不把新 HTML 写入旧版缓存。离线则回退至同版 `index.html`。
- 静态资源优先读取当前版本的精确 URL 缓存；丢失的条目只能以相同 SHA-256 内容修复。不会把新的同名图片写入旧版缓存。
- 仅处理同源 GET 和构建清单中的静态资源；外源、非 GET 与未知 API 请求不进入离线缓存。
- 激活成功后，只清除同一应用 scope 的旧缓存，并接管客户端。未知旧版本 chunk 不会被替换成新版同名代码；部署服务最好短期保留历史带 hash 文件，以兼容尚未刷新的其他标签页。
- 恢复联网或重新回到前台时检查 worker 更新。离线时更新检查失败不影响游戏。

## 旧版白屏恢复

旧版 worker 会拦截范围内所有页面；如果旧 `index.html` 缓存缺失，新页面的内容校验也不匹配，就会只显示“离线资源未完整保留”。这时网页代码没有加载，游戏内更新按钮无法出现。

[恢复入口](https://emtismine520.github.io/goose-lane-art-preview/recover.html) 放在独立的 `/goose-lane-art-preview/` 路径，位于旧 `/goose-lane/` worker 范围之外，因此已经卡住的设备也能打开。点击后仅注销精确匹配 `/goose-lane/` 的旧注册，不删除 IndexedDB、手动存档、Local Storage 或资源缓存，然后打开独立 B 组暖色卡通试玩。其他范围的 worker 不受影响。正式游戏下次进入时会按原流程注册新版离线程序。

新版遇到缓存缺失且网络不可用时返回带手机 viewport、重试按钮和独立恢复链接的 HTML，而不是无法操作的小字页面。

## 验证边界

`tests/pwa.test.ts` 自动验证构建确定性/体积限制、完整缓存安装、失败不伤旧版、离线导航和资源、HTML 版本隔离、scope 清理、请求边界，以及手动激活和刷新时机。这些测试在 Node 的隔离 worker 模拟环境执行；它们不等于真实浏览器离线验收。

真实浏览器验收应使用生产预览或 HTTPS 部署：完整联网打开一次，确认 worker activated 和缓存完整；切换离线后重新打开游戏；恢复联网部署新版，确认只出现更新提示；保存完毕点击更新，确认新版本加载且存档保留。还应分别检查 Android 安装、iOS 添加到主屏幕与子目录部署。

离线能力需要至少一次完整联网加载。浏览器仍可能因存储空间不足、无痕模式或用户清理站点数据而移除缓存。缓存保存的是应用资源，游戏存档由现有 IndexedDB/备份机制负责；PWA 不替代导出存档。

图标从项目原有鹅图形规范化，SVG 与 180/192/512 PNG 均保存在 `public`；不依赖外部图标服务。
