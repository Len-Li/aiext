## 网页 LLM 解读助手（Chrome 扩展）

一个简单的 Chrome 插件：读取当前网页内容，通过你自己的 LLM 接口进行总结/解读，并在 popup 中展示结果。支持在设置页中配置 API 地址、API Key 和模型。

### 文件结构

- `manifest.json`：扩展配置（Manifest V3）
- `background.js`：Service Worker，负责调用 content script 获取网页内容、再请求 LLM 接口
- `content_script.js`：注入到网页中，提取可读文本（`document.body.innerText`）
- `popup.html / popup.js / popup.css`：工具按钮入口，点击后触发「解读当前网页」，展示结果
- `options.html / options.js / options.css`：设置页，可填写 API URL / API Key / 模型
- `overlay.js`：悬浮窗聊天界面，支持流式对话、多语言、字体缩放、面板拖拽和缩放
- `i18n.js` / `i18n-data.js`：国际化支持（中/英/日）
- `utils.js`：共享工具函数
- `icons/`：图标（当前未提供，可自行添加 PNG 图标并与 `manifest.json` 中的路径对应）

### 最新优化（2025-12-12）

- **代码结构和模块化**：合并了 `background.js` 中重复的消息监听器，统一了历史记录相关消息处理。
- **错误处理和日志**：添加了 Service Worker 全局错误处理（`error` 和 `unhandledrejection`），改进了 `callLLM` 函数的错误消息和 60 秒超时机制。
- **性能优化**：为配置读取和页面数据获取添加了内存缓存，减少重复的存储访问和脚本执行。
- **代码一致性和可维护性**：移除了未使用的 `createStatusSetter` 重复定义，为关键函数添加了 JSDoc 注释，统一了代码风格。
- **国际化**：支持中/英/日三语界面，可通过悬浮窗设置切换。

### 如何在 Chrome 中加载

1. 打开 Chrome，访问 `chrome://extensions/`
2. 右上角打开 **开发者模式**
3. 点击 **“加载已解压的扩展程序”**
4. 选择本项目所在的文件夹（包含 `manifest.json` 的目录）
5. 加载成功后，会看到扩展图标（如无自定义图标则为默认图标）

### 首次使用前的配置

1. 在扩展列表里找到「网页 LLM 解读助手」
2. 点击「详情」→「扩展选项」或在 popup 中点击「设置」按钮
3. 在设置页中填写：
   - **API 地址（URL）**：你的 LLM 接口地址  
     - 示例（OpenAI 兼容）：`https://api.your-llm.com/v1/chat/completions`
   - **API Key**：你的密钥
   - **模型名称**：例如 `gpt-4.1`、`gpt-4o`、`qwen-max` 等
4. 点击「保存设置」

### 当前默认的请求格式（可自定义）

在 `background.js` 中的 `callLLM` 函数里，默认使用 OpenAI Chat Completions 兼容格式：

- 请求方法：`POST`
- 请求体大致为：

```json
{
  "model": "你的模型名",
  "messages": [
    { "role": "system", "content": "你是一个帮助用户用简体中文解释网页内容的助手..." },
    { "role": "user", "content": "包含网页标题、URL 和正文内容的长文本" }
  ]
}
```

- 请求头中会附带：

```http
Authorization: Bearer <你的 API Key>
Content-Type: application/json
```

如果你的 LLM 接口不是 OpenAI 兼容的，只需要根据你的接口协议修改：

- `background.js` → `callLLM(pageData)` 中的 `fetch(apiUrl, { ... })` 部分：
  - URL / method / headers
  - body 的结构
  - 以及解析响应数据的逻辑（`data.choices[0].message.content` 等）

### 使用方式

1. 打开任意网页
2. 点击浏览器工具栏中的「LLM 解读助手」图标
3. 在弹出的 popup 中点击 **「解读当前网页」**
4. 等待片刻，解读结果会显示在下方文本框中

### 悬浮窗聊天模式

除了传统的 popup 解读，本扩展还提供了更强大的悬浮窗聊天模式：

- 在任意网页上按 **Ctrl+Shift+L**（可自定义）打开悬浮窗
- 支持流式对话、多轮对话、历史记录管理
- 可切换语言、调整字体大小、拖拽和缩放面板
- 对话历史保存在本地存储中，支持搜索和删除

### 安全与隐私

- API Key、API 地址和模型名称保存在 `chrome.storage.sync` 中：
  - 会在你的浏览器个人配置中同步（同一账号的浏览器之间可能同步）
  - 不会上传到本扩展作者的任何服务器
- 网页内容会被发送到你配置的 LLM 接口，请确保你信任自己的后端服务，并在隐私敏感页面谨慎使用。

## 作者

李乐恒
