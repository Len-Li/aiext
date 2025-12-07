// overlay.js - 在网页上显示一个可展开的悬浮窗

// 防止重复注入
if (!window.__llm_reader_overlay_injected__) {
  window.__llm_reader_overlay_injected__ = true;

  const STYLE_ID = "__llm_reader_overlay_style__";

  function injectStyle() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      :root {
        --llm-reader-base-font-size: 12px;
        --llm-reader-title-font-size: 13px;
        --llm-reader-input-font-size: 12px;
        --llm-reader-chat-font-size: 12px;
        --llm-reader-status-font-size: 11px;
        --llm-reader-btn-font-size: 11px;
        --llm-reader-select-font-size: 11px;
        --llm-reader-close-font-size: 12px;
        --llm-reader-role-font-size: 11px;
      }
      
      .llm-reader-float-btn {
        position: fixed;
        right: 0px;
        top: 50%;
        transform: translateY(-50%);
        z-index: 2147483647;
        width: 56px;
        height: 56px;
        border: none;
        background: transparent;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        user-select: none;
        padding: 0;
        box-sizing: border-box;
        pointer-events: auto;
      }

      .llm-reader-float-btn img {
        width: 100%;
        height: 100%;
        object-fit: contain;
        display: block;
        pointer-events: none;
        user-select: none;
        transition: opacity 0.2s, transform 0.2s;
      }

      .llm-reader-float-btn:hover img {
        opacity: 0.8;
        transform: scale(1.05);
        transition: opacity 0.2s, transform 0.2s;
      }

      .llm-reader-panel {
        position: fixed;
        right: 2%;
        top: 1%;
        transform: none;
        z-index: 2147483647;
        width: 33.33%;
        height: 98vh;
        max-height: 100vh;
        background: #ffffff;
        border-radius: 12px;
        border: 1px solid rgba(0, 0, 0, 0.08);
        box-shadow:
          0 3px 5px -1px rgba(0, 0, 0, 0.2),
          0 6px 10px 0 rgba(0, 0, 0, 0.14),
          0 1px 18px 0 rgba(0, 0, 0, 0.12);
        display: flex;
        flex-direction: column;
        overflow: hidden;
        color: #202124;
        font-family: Roboto, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }

      .llm-reader-panel-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 10px 12px 8px;
        border-bottom: 1px solid rgba(0, 0, 0, 0.06);
        cursor: move;
        background: #f8f9fa;
      }

      .llm-reader-panel-title {
        font-size: var(--llm-reader-title-font-size);
        font-weight: 500;
      }

      .llm-reader-panel-actions {
        display: flex;
        align-items: center;
        gap: 6px;
        flex-wrap: wrap;
        justify-content: flex-end;
      }

      .llm-reader-actions-group {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 2px 6px;
        border-radius: 999px;
        background: #f3f4f6;
        border: 1px solid #e5e7eb;
      }

      .llm-reader-profile-select {
        min-width: 120px;
        max-width: 200px;
        padding: 2px 6px;
        border-radius: 999px;
        border: 1px solid #dadce0;
        background: #ffffff;
        color: #202124;
        font-size: var(--llm-reader-select-font-size);
        outline: none;
        cursor: pointer;
      }

      .llm-reader-btn {
        border-radius: 999px;
        padding: 3px 8px;
        border: 1px solid #dadce0;
        background: #ffffff;
        color: #1f2933;
        font-size: var(--llm-reader-btn-font-size);
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 3px;
      }

      .llm-reader-btn:hover {
        background: #f6f9fe;
        border-color: #1a73e8;
      }

      .llm-reader-close {
        border-radius: 999px;
        width: 22px;
        height: 22px;
        border: none;
        background: transparent;
        color: #5f6368;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: var(--llm-reader-close-font-size);
      }

      .llm-reader-font-size-controls {
        display: flex;
        align-items: center;
        gap: 3px;
        margin-left: 0;
      }

      .llm-reader-font-size-btn {
        width: 20px;
        height: 20px;
        border-radius: 50%;
        border: 1px solid #dadce0;
        background: #ffffff;
        color: #1f2933;
        font-size: 14px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        line-height: 1;
      }

      .llm-reader-font-size-btn:hover {
        background: #f6f9fe;
        border-color: #1a73e8;
      }

      .llm-reader-font-size-btn:disabled {
        opacity: 0.4;
        cursor: not-allowed;
      }

      .llm-reader-font-size-btn:disabled:hover {
        background: #ffffff;
        border-color: #dadce0;
      }

      .llm-reader-panel-body {
        padding: 8px 10px 10px;
        display: flex;
        flex-direction: column;
        gap: 6px;
        position: relative;
        flex: 1;
        min-height: 0;
      }

      .llm-reader-status {
        font-size: var(--llm-reader-status-font-size);
        color: #5f6368;
        min-height: 16px;
      }

      .llm-reader-chat-list {
        flex: 1;
        min-height: 160px;
        overflow-y: auto;
        border-radius: 8px;
        border: 1px solid #e0e0e0;
        background: #f8f9fa;
        padding: 6px 8px;
        display: flex;
        flex-direction: column;
        gap: 6px;
        font-size: var(--llm-reader-chat-font-size);
        box-sizing: border-box;
        padding-bottom: 18px; /* 预留底部空间，避免内容被输入框/缩放角标挡住 */
      }

      .llm-reader-chat-item {
        display: flex;
        gap: 2px;
      }

      .llm-reader-chat-role {
        font-size: var(--llm-reader-role-font-size);
        color: #5f6368;
        min-width: 0;
        text-align: right;
        padding-top: 2px;
      }

      .llm-reader-chat-bubble {
        flex: 1;
        padding: 6px 8px;
        border-radius: 8px;
        border: 1px solid #e0e0e0;
        background: #ffffff;
        white-space: pre-wrap;
        word-break: break-word;
        line-height: 1.6;
      }

      .llm-reader-chat-bubble h1,
      .llm-reader-chat-bubble h2,
      .llm-reader-chat-bubble h3,
      .llm-reader-chat-bubble h4,
      .llm-reader-chat-bubble h5,
      .llm-reader-chat-bubble h6 {
        margin: 4px 0 2px 0;
        font-weight: 600;
        line-height: 1.4;
      }

      .llm-reader-chat-bubble h1 {
        font-size: 1.3em;
      }

      .llm-reader-chat-bubble h2 {
        font-size: 1.2em;
      }

      .llm-reader-chat-bubble h3 {
        font-size: 1.1em;
      }

      .llm-reader-chat-bubble h4 {
        font-size: 1.05em;
      }

      .llm-reader-chat-bubble h5,
      .llm-reader-chat-bubble h6 {
        font-size: 1em;
      }

      .llm-reader-chat-bubble-user {
        background: #e8f0fe;
        border-color: #c3d5fd;
      }

      .llm-reader-chat-bubble-assistant {
        background: #ffffff;
      }

      .llm-reader-chat-bubble-collapsible {
        position: relative;
      }

      .llm-reader-chat-bubble-collapsed {
        max-height: 150px;
        overflow: hidden;
        position: relative;
      }

      .llm-reader-chat-bubble-collapsed::after {
        content: "";
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: 40px;
        pointer-events: none;
      }

      .llm-reader-chat-bubble-collapsed.llm-reader-chat-bubble-user::after {
        background: linear-gradient(to bottom, rgba(232, 240, 254, 0), rgba(232, 240, 254, 1));
      }

      .llm-reader-chat-bubble-collapsed.llm-reader-chat-bubble-assistant::after {
        background: linear-gradient(to bottom, rgba(255, 255, 255, 0), rgba(255, 255, 255, 1));
      }

      .llm-reader-chat-expand-btn {
        margin-top: 4px;
        padding: 2px 8px;
        font-size: 11px;
        color: #1a73e8;
        background: transparent;
        border: none;
        cursor: pointer;
        text-align: left;
        display: inline-flex;
        align-items: center;
        gap: 4px;
      }

      .llm-reader-chat-expand-btn:hover {
        text-decoration: underline;
      }

      .llm-reader-input-row {
        display: flex;
        align-items: flex-end;
        gap: 6px;
        margin-top: 4px;
      }

      .llm-reader-input {
        flex: 1;
        min-height: 32px;
        max-height: 80px;
        resize: none;
        border-radius: 8px;
        border: 1px solid #dadce0;
        background: #ffffff;
        color: #202124;
        padding: 5px 8px;
        font-size: var(--llm-reader-input-font-size);
        box-sizing: border-box;
      }

      .llm-reader-input::placeholder {
        color: #9aa0a6;
      }

      .llm-reader-send-btn {
        border-radius: 999px;
        padding: 5px 10px;
        border: none;
        background: #1a73e8;
        color: #ffffff;
        font-size: 11px;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 4px;
        white-space: nowrap;
      }

      .llm-reader-send-btn:disabled {
        opacity: 0.6;
        cursor: default;
        box-shadow: none;
      }

      .llm-reader-resize-handle {
        position: absolute;
        right: 4px;
        bottom: 4px;
        width: 14px;
        height: 14px;
        cursor: nwse-resize;
        opacity: 0.65;
        pointer-events: auto;
        z-index: 2;
      }

      .llm-reader-resize-handle::before {
        content: "";
        position: absolute;
        right: 2px;
        bottom: 2px;
        width: 10px;
        height: 10px;
        border-right: 1px solid #dadce0;
        border-bottom: 1px solid #dadce0;
        box-sizing: border-box;
      }

      .llm-reader-resize-corner {
        position: absolute;
        width: 10px;
        height: 10px;
        z-index: 2;
      }

      .llm-reader-resize-corner-tl {
        top: 0;
        left: 0;
        cursor: nwse-resize;
      }

      .llm-reader-resize-corner-tr {
        top: 0;
        right: 0;
        cursor: nesw-resize;
      }

      .llm-reader-resize-corner-bl {
        bottom: 0;
        left: 0;
        cursor: nesw-resize;
      }

      .llm-reader-resize-edge {
        position: absolute;
        z-index: 1;
      }

      .llm-reader-resize-edge-left {
        left: 0;
        top: 0;
        width: 4px;
        height: 100%;
        cursor: ew-resize;
      }

      .llm-reader-resize-edge-right {
        right: 0;
        top: 0;
        width: 4px;
        height: 100%;
        cursor: ew-resize;
      }

      .llm-reader-resize-edge-top {
        left: 0;
        top: 0;
        width: 100%;
        height: 4px;
        cursor: ns-resize;
      }

      .llm-reader-resize-edge-bottom {
        left: 0;
        bottom: 0;
        width: 100%;
        height: 1px;
        background: rgba(0, 0, 0, 0.1);
        cursor: ns-resize;
      }

      .llm-reader-navigation-controls {
        display: flex;
        align-items: center;
        gap: 3px;
        margin-left: 0;
      }

      .llm-reader-nav-btn {
        width: 22px;
        height: 22px;
        border-radius: 50%;
        border: 1px solid #dadce0;
        background: #ffffff;
        color: #1f2933;
        font-size: 11px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        line-height: 1;
        padding: 0;
      }

      .llm-reader-nav-btn:hover {
        background: #f6f9fe;
        border-color: #1a73e8;
      }

      .llm-reader-nav-btn:disabled {
        opacity: 0.4;
        cursor: not-allowed;
      }

      .llm-reader-nav-btn:disabled:hover {
        background: #ffffff;
        border-color: #dadce0;
      }

      .llm-reader-nav-info {
        font-size: var(--llm-reader-status-font-size);
        color: #5f6368;
        margin: 0 4px;
        white-space: nowrap;
      }
    `;
    document.head.appendChild(style);
  }

  function createOverlay() {
    injectStyle();

    const floatBtn = document.createElement("div");
    floatBtn.className = "llm-reader-float-btn";
    
    // 创建图片元素代替文字
    const logoImg = document.createElement("img");
    logoImg.src = chrome.runtime.getURL("img/logo.png");
    logoImg.alt = "LLM";
    logoImg.onerror = function() {
      // 如果图片加载失败，显示文字作为后备
      floatBtn.textContent = "LLM";
      floatBtn.style.padding = "0";
    };
    floatBtn.appendChild(logoImg);

    const panel = document.createElement("div");
    panel.className = "llm-reader-panel";
    panel.style.display = "none";

    // header
    const header = document.createElement("div");
    header.className = "llm-reader-panel-header";

    const title = document.createElement("div");
    title.className = "llm-reader-panel-title";
    title.textContent = "";

    const actions = document.createElement("div");
    actions.className = "llm-reader-panel-actions";

    const profileSelect = document.createElement("select");
    profileSelect.className = "llm-reader-profile-select";

    const analyzeBtn = document.createElement("button");
    analyzeBtn.className = "llm-reader-btn";
    analyzeBtn.textContent = "解读本页";

    const settingsBtn = document.createElement("button");
    settingsBtn.className = "llm-reader-btn";
    settingsBtn.textContent = "设置";

    const closeBtn = document.createElement("button");
    closeBtn.className = "llm-reader-close";
    closeBtn.textContent = "×";

    // 文字大小控制按钮
    const fontSizeControls = document.createElement("div");
    fontSizeControls.className = "llm-reader-font-size-controls";

    const decreaseFontSizeBtn = document.createElement("button");
    decreaseFontSizeBtn.className = "llm-reader-font-size-btn";
    decreaseFontSizeBtn.textContent = "−";
    decreaseFontSizeBtn.title = "减小文字大小";

    const increaseFontSizeBtn = document.createElement("button");
    increaseFontSizeBtn.className = "llm-reader-font-size-btn";
    increaseFontSizeBtn.textContent = "+";
    increaseFontSizeBtn.title = "增大文字大小";

    fontSizeControls.appendChild(decreaseFontSizeBtn);
    fontSizeControls.appendChild(increaseFontSizeBtn);

    // 导航控制按钮
    const navigationControls = document.createElement("div");
    navigationControls.className = "llm-reader-navigation-controls";

    const prevBtn = document.createElement("button");
    prevBtn.className = "llm-reader-nav-btn";
    prevBtn.textContent = "↑";
    prevBtn.title = "上一个问答";
    prevBtn.disabled = true;

    const nextBtn = document.createElement("button");
    nextBtn.className = "llm-reader-nav-btn";
    nextBtn.textContent = "↓";
    nextBtn.title = "下一个问答";
    nextBtn.disabled = true;

    navigationControls.appendChild(prevBtn);
    navigationControls.appendChild(nextBtn);

    const mainActionsGroup = document.createElement("div");
    mainActionsGroup.className = "llm-reader-actions-group";
    mainActionsGroup.appendChild(profileSelect);
    mainActionsGroup.appendChild(analyzeBtn);

    const readingActionsGroup = document.createElement("div");
    readingActionsGroup.className = "llm-reader-actions-group";
    readingActionsGroup.appendChild(navigationControls);
    readingActionsGroup.appendChild(fontSizeControls);

    const utilityActionsGroup = document.createElement("div");
    utilityActionsGroup.className = "llm-reader-actions-group";
    utilityActionsGroup.appendChild(settingsBtn);

    actions.appendChild(mainActionsGroup);
    actions.appendChild(readingActionsGroup);
    actions.appendChild(utilityActionsGroup);
    actions.appendChild(closeBtn);
    header.appendChild(title);
    header.appendChild(actions);

    // body
    const body = document.createElement("div");
    body.className = "llm-reader-panel-body";

    const status = document.createElement("div");
    status.className = "llm-reader-status";

    const chatList = document.createElement("div");
    chatList.className = "llm-reader-chat-list";

    const inputRow = document.createElement("div");
    inputRow.className = "llm-reader-input-row";

    const input = document.createElement("textarea");
    input.className = "llm-reader-input";
    input.rows = 1;
    input.placeholder = "继续就当前网页提问，回车发送…";

    const sendBtn = document.createElement("button");
    sendBtn.className = "llm-reader-send-btn";
    sendBtn.textContent = "发送";

    const resizeCornerBR = document.createElement("div");
    resizeCornerBR.className = "llm-reader-resize-handle";

    const resizeCornerTL = document.createElement("div");
    resizeCornerTL.className =
      "llm-reader-resize-corner llm-reader-resize-corner-tl";

    const resizeCornerTR = document.createElement("div");
    resizeCornerTR.className =
      "llm-reader-resize-corner llm-reader-resize-corner-tr";

    const resizeCornerBL = document.createElement("div");
    resizeCornerBL.className =
      "llm-reader-resize-corner llm-reader-resize-corner-bl";

    const resizeEdgeLeft = document.createElement("div");
    resizeEdgeLeft.className = "llm-reader-resize-edge llm-reader-resize-edge-left";

    const resizeEdgeRight = document.createElement("div");
    resizeEdgeRight.className = "llm-reader-resize-edge llm-reader-resize-edge-right";

    const resizeEdgeTop = document.createElement("div");
    resizeEdgeTop.className = "llm-reader-resize-edge llm-reader-resize-edge-top";

    const resizeEdgeBottom = document.createElement("div");
    resizeEdgeBottom.className = "llm-reader-resize-edge llm-reader-resize-edge-bottom";

    inputRow.appendChild(input);
    inputRow.appendChild(sendBtn);

    body.appendChild(status);
    body.appendChild(chatList);
    body.appendChild(inputRow);
    // 先添加边缘，再添加角落和右下角柄，保证柄在最上层
    body.appendChild(resizeEdgeLeft);
    body.appendChild(resizeEdgeRight);
    body.appendChild(resizeEdgeTop);
    body.appendChild(resizeEdgeBottom);
    body.appendChild(resizeCornerTL);
    body.appendChild(resizeCornerTR);
    body.appendChild(resizeCornerBL);
    body.appendChild(resizeCornerBR);

    panel.appendChild(header);
    panel.appendChild(body);

    let pageDataCache = null;
    let messages = [];
    let isStreaming = false;
    let isResizing = false;
    let isDragging = false;
    let dragStartX = 0;
    let dragStartY = 0;
    let dragStartTop = 0;
    let dragStartLeft = 0;
    let hasCustomPos = false;
    
    // 滚动控制相关变量
    let shouldAutoScroll = false; // 是否应该自动滚动（只有用户手动滚动到底部时才为true）

    // 悬浮按钮拖动相关状态
    let isDraggingFloat = false;
    let floatDragStartX = 0;
    let floatDragStartY = 0;
    let floatOffsetX = 0;
    let floatOffsetY = 0;
    let floatWidth = 0;
    let floatHeight = 0;
    let floatHasCustomPos = false;
    let floatWasDragged = false;

    // LLM 配置（多配置）缓存
    let llmProfiles = [];
    let activeLlmId = null;

    // 文字大小管理
    let currentFontSize = 12; // 默认文字大小
    const MIN_FONT_SIZE = 10;
    const MAX_FONT_SIZE = 20;
    const FONT_SIZE_STEP = 1;

    // 问答导航相关变量
    let currentQaIndex = -1; // 当前显示的问答索引，-1表示显示全部
    let qaPairs = []; // 问答对数组

    function updateFontSize(newSize) {
      // 确保文字大小在允许范围内
      newSize = Math.max(MIN_FONT_SIZE, Math.min(MAX_FONT_SIZE, newSize));
      
      if (newSize === currentFontSize) return; // 没有变化，直接返回
      
      currentFontSize = newSize;
      
      // 更新CSS变量
      document.documentElement.style.setProperty('--llm-reader-base-font-size', currentFontSize + 'px');
      document.documentElement.style.setProperty('--llm-reader-title-font-size', (currentFontSize + 1) + 'px');
      document.documentElement.style.setProperty('--llm-reader-input-font-size', currentFontSize + 'px');
      document.documentElement.style.setProperty('--llm-reader-chat-font-size', currentFontSize + 'px');
      document.documentElement.style.setProperty('--llm-reader-status-font-size', (currentFontSize - 1) + 'px');
      document.documentElement.style.setProperty('--llm-reader-btn-font-size', (currentFontSize - 1) + 'px');
      document.documentElement.style.setProperty('--llm-reader-select-font-size', (currentFontSize - 1) + 'px');
      document.documentElement.style.setProperty('--llm-reader-close-font-size', currentFontSize + 'px');
      document.documentElement.style.setProperty('--llm-reader-role-font-size', (currentFontSize - 1) + 'px');
      
      // 更新按钮状态
      decreaseFontSizeBtn.disabled = currentFontSize <= MIN_FONT_SIZE;
      increaseFontSizeBtn.disabled = currentFontSize >= MAX_FONT_SIZE;
      
      // 保存到存储
      chrome.storage.sync.set({ fontSize: currentFontSize });
      
      // 显示状态提示
      setStatus(`文字大小: ${currentFontSize}px`);
      setTimeout(() => setStatus(""), 1500);
    }

    async function loadFontSize() {
      try {
        const data = await chrome.storage.sync.get(['fontSize']);
        const savedFontSize = data.fontSize;
        if (savedFontSize && savedFontSize >= MIN_FONT_SIZE && savedFontSize <= MAX_FONT_SIZE) {
          updateFontSize(savedFontSize);
        } else {
          updateFontSize(currentFontSize); // 使用默认值
        }
      } catch (e) {
        console.error('加载文字大小设置失败:', e);
        updateFontSize(currentFontSize); // 使用默认值
      }
    }

    function setStatus(text, isError = false) {
      status.textContent = text || "";
      status.style.color = isError ? "#f97373" : "#9ca3af";
    }

    // 简单 Markdown 渲染（针对 LLM 返回内容，主要支持常见文本格式）
    function escapeHtml(str) {
      return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
    }

    function markdownToHtml(md) {
      if (!md) return "";

      // 先处理代码块 ``` ```，保留换行
      const parts = md.split(/```/);
      let html = "";
      parts.forEach((part, index) => {
        if (index % 2 === 1) {
          // 代码块
          html +=
            "<pre><code>" + escapeHtml(part.replace(/^\s+|\s+$/g, "")) + "</code></pre>";
        } else {
          // 普通文本部分做简单 markdown 处理
          let text = escapeHtml(part);
          
          // 按行处理，更精确地控制标题和换行
          const lines = text.split('\n');
          const processedLines = [];
          
          for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            // 检查是否是标题行
            const titleMatch = line.match(/^\s*(#{1,6})\s+(.+?)\s*$/);
            if (titleMatch) {
              const level = titleMatch[1].length;
              const content = titleMatch[2];
              processedLines.push(`<h${level}>${content}</h${level}>`);
            } else {
              // 非标题行，保留原样（后续会处理换行）
              processedLines.push(line);
            }
          }
          
          text = processedLines.join('\n');
          
          // 粗体 **text**
          text = text.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
          // 行内代码 `code`
          text = text.replace(/`([^`]+)`/g, "<code>$1</code>");
          // 无序列表 - / * 开头的行（转成前缀符号）
          text = text.replace(
            /(^|\n)[\-\*]\s+(.+?)(?=\n|$)/g,
            (_, p1, p2) => `${p1}• ${p2}`
          );
          // 网址自动变链接（简单判断）
          text = text.replace(
            /(https?:\/\/[^\s]+)/g,
            '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>'
          );
          
          // 换行处理：标题标签是块级元素，前后不需要 <br>
          // 移除标题前后的换行符
          text = text.replace(/\n\s*(<\/?h[1-6][^>]*>)\s*\n/g, '$1');
          text = text.replace(/\n\s*(<\/?h[1-6][^>]*>)/g, '$1');
          text = text.replace(/(<\/?h[1-6][^>]*>)\s*\n/g, '$1');
          // 处理剩余的换行
          text = text.replace(/\n/g, "<br>");
          html += text;
        }
      });

      return html;
    }

    function normalizeApiUrl(raw) {
      if (!raw) return "";
      let url = String(raw).trim();
      url = url.replace(/\/+$/, "");

      try {
        const u = new URL(url);
        const base = u.origin;
        let path = u.pathname || "";
        path = path.replace(/\/+$/, "");

        if (!path || path === "/") {
          return base + "/v1/chat/completions";
        }
        if (path === "/v1") {
          return base + "/v1/chat/completions";
        }
        if (path === "/v1/chat" || path === "/v1/chat/") {
          return base + "/v1/chat/completions";
        }
        if (path === "/v1/completions") {
          return base + "/v1/chat/completions";
        }
        if (path.startsWith("/v1/chat/completions")) {
          return base + path;
        }

        return base + path;
      } catch {
        return url;
      }
    }

    async function loadProfiles() {
      const data = await chrome.storage.sync.get([
        "llmProfiles",
        "activeLlmId",
        "apiUrl",
        "apiKey",
        "model",
      ]);

      let profiles = Array.isArray(data.llmProfiles) ? data.llmProfiles : [];

      // 兼容旧版本：自动从单一配置迁移
      if (!profiles.length && (data.apiUrl || data.apiKey || data.model)) {
        const legacyProfile = {
          id: "default",
          name: "默认配置",
          apiUrl: data.apiUrl || "",
          apiKey: data.apiKey || "",
          model: data.model || "",
        };
        profiles = [legacyProfile];
        await chrome.storage.sync.set({
          llmProfiles: profiles,
          activeLlmId: legacyProfile.id,
        });
      }

      // 没有任何配置时，创建一个占位配置，提醒用户去设置
      if (!profiles.length) {
        profiles = [
          {
            id: "empty",
            name: "未配置，请前往设置",
            apiUrl: "",
            apiKey: "",
            model: "",
          },
        ];
      }

      llmProfiles = profiles;
      activeLlmId = data.activeLlmId || profiles[0].id;

      // 渲染下拉框
      profileSelect.innerHTML = "";
      llmProfiles.forEach((p) => {
        const opt = document.createElement("option");
        opt.value = p.id;
        opt.textContent = p.name || "(未命名配置)";
        profileSelect.appendChild(opt);
      });
      profileSelect.value = activeLlmId;
    }

    // 添加配置选择事件监听器
    profileSelect.addEventListener("change", async () => {
      const selectedId = profileSelect.value;
      const selectedProfile = llmProfiles.find(p => p.id === selectedId);
      
      if (selectedProfile) {
        activeLlmId = selectedId;
        // 保存到 Chrome storage
        await chrome.storage.sync.set({ activeLlmId: selectedId });
        // 显示用户反馈
        setStatus(`已切换到配置：${selectedProfile.name || '未命名配置'}`);
        setTimeout(() => setStatus(""), 2000);
      } else {
        console.error("选择的配置不存在:", selectedId);
        setStatus("选择的配置不存在", true);
        setTimeout(() => setStatus(""), 2000);
      }
    });

    // 拖动整个面板位置（支持上下左右移动），在面板大部分区域拖动
    (function initDrag() {
      panel.addEventListener("mousedown", (e) => {
        // 这些区域保留文本选择/输入等交互，不触发拖拽
        if (
          e.target === analyzeBtn ||
          e.target === settingsBtn ||
          e.target === closeBtn ||
          e.target === sendBtn ||
          e.target === input ||
          e.target === profileSelect ||
          e.target.closest(".llm-reader-input-row") ||
          e.target.closest(".llm-reader-chat-bubble") ||
          e.target.closest(".llm-reader-resize-handle")
        ) {
          return;
        }

        e.preventDefault();
        isDragging = true;

        const rect = panel.getBoundingClientRect();
        dragStartX = e.clientX;
        dragStartY = e.clientY;
        dragStartTop = rect.top;
        dragStartLeft = rect.left;

        // 第一次拖动时，确保使用固定 top/left，而不是依赖 transform 或 right
        if (!hasCustomPos) {
          hasCustomPos = true;
          panel.style.transform = "none";
          panel.style.top = rect.top + "px";
          panel.style.left = rect.left + "px";
          panel.style.right = "auto";
        }

        document.addEventListener("mousemove", onDragMove);
        document.addEventListener("mouseup", onDragEnd);
      });

      function onDragMove(e) {
        if (!isDragging) return;
        const dx = e.clientX - dragStartX;
        const dy = e.clientY - dragStartY;

        const viewportWidth =
          window.innerWidth || document.documentElement.clientWidth;
        const viewportHeight =
          window.innerHeight || document.documentElement.clientHeight;
        const panelRect = panel.getBoundingClientRect();
        const width = panelRect.width;
        const height = panelRect.height;
        const margin = 10;

        let newTop = dragStartTop + dy;
        let newLeft = dragStartLeft + dx;

        // 限制面板不会完全拖出屏幕
        newTop = Math.max(margin, Math.min(viewportHeight - height - margin, newTop));
        newLeft = Math.max(margin, Math.min(viewportWidth - width - margin, newLeft));

        panel.style.top = newTop + "px";
        panel.style.left = newLeft + "px";
      }

      function onDragEnd() {
        if (!isDragging) return;
        isDragging = false;
        document.removeEventListener("mousemove", onDragMove);
        document.removeEventListener("mouseup", onDragEnd);
      }
    })();

    // 悬浮按钮拖动：支持在页面任意位置拖动 LLM 按钮
    (function initFloatDrag() {
      function onFloatMove(e) {
        if (!isDraggingFloat) return;

        const dx = e.clientX - floatDragStartX;
        const dy = e.clientY - floatDragStartY;
        if (!floatWasDragged && (Math.abs(dx) > 3 || Math.abs(dy) > 3)) {
          floatWasDragged = true;
        }

        const viewportWidth =
          window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
        const viewportHeight =
          window.innerHeight ||
          document.documentElement.clientHeight ||
          document.body.clientHeight;
        const margin = 8;

        let newLeft = e.clientX - floatOffsetX;
        let newTop = e.clientY - floatOffsetY;

        newLeft = Math.max(margin, Math.min(viewportWidth - floatWidth - margin, newLeft));
        newTop = Math.max(margin, Math.min(viewportHeight - floatHeight - margin, newTop));

        if (!floatHasCustomPos) {
          floatHasCustomPos = true;
          floatBtn.style.right = "auto";
          floatBtn.style.bottom = "auto";
          floatBtn.style.transform = "none"; // 移除transform，避免位置计算错误
        }

        floatBtn.style.left = newLeft + "px";
        floatBtn.style.top = newTop + "px";
      }

      function onFloatUp() {
        if (!isDraggingFloat) return;
        isDraggingFloat = false;
        document.removeEventListener("mousemove", onFloatMove);
        document.removeEventListener("mouseup", onFloatUp);
      }

      floatBtn.addEventListener("mousedown", (e) => {
        e.preventDefault();
        isDraggingFloat = true;
        floatWasDragged = false;

        const rect = floatBtn.getBoundingClientRect();
        floatWidth = rect.width;
        floatHeight = rect.height;

        floatDragStartX = e.clientX;
        floatDragStartY = e.clientY;
        floatOffsetX = e.clientX - rect.left;
        floatOffsetY = e.clientY - rect.top;

        document.addEventListener("mousemove", onFloatMove);
        document.addEventListener("mouseup", onFloatUp);
      });
    })();

    document.documentElement.appendChild(floatBtn);
    document.documentElement.appendChild(panel);

    // 面板缩放逻辑
    (function initResize() {
      const minWidth = 260;
      const maxWidth = Math.min(window.innerWidth * 0.9, 1000);
      const minHeight = 220;
      const maxHeight = 800;

      let startX = 0;
      let startY = 0;
      let startWidth = 0;
      let startHeight = 0;
      let startTop = 0;
      let startLeft = 0;
      // right / left / top / bottom / bottom-right / bottom-left / top-right / top-left
      let resizeMode = "bottom-right";

      function onMouseMove(e) {
        if (!isResizing) return;
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;

        let newWidth = startWidth;
        let newHeight = startHeight;

        const isRight =
          resizeMode === "right" ||
          resizeMode === "bottom-right" ||
          resizeMode === "top-right";
        const isLeft =
          resizeMode === "left" ||
          resizeMode === "bottom-left" ||
          resizeMode === "top-left";
        const isBottom =
          resizeMode === "bottom" ||
          resizeMode === "bottom-right" ||
          resizeMode === "bottom-left";
        const isTop =
          resizeMode === "top" ||
          resizeMode === "top-right" ||
          resizeMode === "top-left";

        if (isRight) {
          // 右侧相关：向右拖动增宽，向左拖动变窄
          newWidth = startWidth + dx;
        } else if (isLeft) {
          // 左侧相关：向左拖动增宽，向右拖动变窄（右侧固定）
          newWidth = startWidth - dx;
        }

        if (isBottom) {
          // 底部相关：向下拖动增高，向上拖动变矮
          newHeight = startHeight + dy;
        } else if (isTop) {
          // 顶部相关：向上拖动增高，向下拖动变矮，并调整 top
          newHeight = startHeight - dy;
        }

        newWidth = Math.max(minWidth, Math.min(maxWidth, newWidth));
        newHeight = Math.max(minHeight, Math.min(maxHeight, newHeight));

        // 如果从左侧缩放，需要同时更新 left，保持右侧边缘固定
        if (isLeft) {
          const viewportWidth =
            window.innerWidth || document.documentElement.clientWidth;
          const margin = 10;
          // 计算新的left位置：保持右侧边缘不变
          const actualDx = startWidth - newWidth; // 宽度变化量
          let newLeft = startLeft + actualDx;
          // 确保面板不会完全拖出屏幕左侧
          newLeft = Math.max(margin, Math.min(viewportWidth - newWidth - margin, newLeft));
          panel.style.left = newLeft + "px";
          panel.style.right = "auto";
        }

        // 如果从顶部缩放，需要同时更新 top，保证面板不出屏幕
        if (isTop) {
          const viewportHeight =
            window.innerHeight || document.documentElement.clientHeight;
          const margin = 10;
          let newTop = startTop + dy;
          const maxTop = viewportHeight - newHeight - margin;
          newTop = Math.max(margin, Math.min(maxTop, newTop));
          panel.style.top = newTop + "px";
        }

        panel.style.width = newWidth + "px";
        panel.style.height = newHeight + "px";
        panel.style.maxHeight = maxHeight + "px";
      }

      function onMouseUp() {
        if (!isResizing) return;
        isResizing = false;
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
      }

      function startResize(e, mode) {
        e.preventDefault();
        e.stopPropagation();
        isResizing = true;
        resizeMode = mode;
        startX = e.clientX;
        startY = e.clientY;
        const rect = panel.getBoundingClientRect();
        startWidth = rect.width;
        startHeight = rect.height;

        // 确保使用固定 top 和 left，而不是 transform 居中或 right 定位
        if (!hasCustomPos) {
          hasCustomPos = true;
          panel.style.transform = "none";
          panel.style.top = rect.top + "px";
          panel.style.left = rect.left + "px";
          panel.style.right = "auto";
        }
        startTop = parseFloat(panel.style.top || rect.top);
        startLeft = parseFloat(panel.style.left || rect.left);

        document.addEventListener("mousemove", onMouseMove);
        document.addEventListener("mouseup", onMouseUp);
      }

      resizeCornerBR.addEventListener("mousedown", (e) => {
        startResize(e, "bottom-right");
      });

      resizeEdgeRight.addEventListener("mousedown", (e) => {
        startResize(e, "right");
      });

      resizeEdgeLeft.addEventListener("mousedown", (e) => {
        startResize(e, "left");
      });

      resizeEdgeBottom.addEventListener("mousedown", (e) => {
        startResize(e, "bottom");
      });

      resizeEdgeTop.addEventListener("mousedown", (e) => {
        startResize(e, "top");
      });

      resizeCornerTL.addEventListener("mousedown", (e) => {
        startResize(e, "top-left");
      });

      resizeCornerTR.addEventListener("mousedown", (e) => {
        startResize(e, "top-right");
      });

      resizeCornerBL.addEventListener("mousedown", (e) => {
        startResize(e, "bottom-left");
      });
    })();

    // 提取问答对（忽略system消息）
    function extractQaPairs(messages) {
      const pairs = [];
      let currentPair = null;
      
      for (const msg of messages) {
        if (msg.role === "system") {
          continue; // 跳过system消息
        }
        
        if (msg.role === "user") {
          // 如果之前有未完成的pair，先保存
          if (currentPair && currentPair.assistant) {
            pairs.push(currentPair);
          }
          // 开始新的问答对
          currentPair = { user: msg, assistant: null };
        } else if (msg.role === "assistant" && currentPair) {
          currentPair.assistant = msg;
          pairs.push(currentPair);
          currentPair = null;
        }
      }
      
      // 处理最后一个未完成的pair（如果用户刚发送了问题但还没收到回复）
      if (currentPair) {
        pairs.push(currentPair);
      }
      
      return pairs;
    }

    // 渲染聊天消息，支持滚动到指定问答对
    function renderChatMessages(messagesToShow, scrollToQaIndex = -1, preserveScroll = false) {
      chatList.innerHTML = "";
      
      // 记录需要滚动到的消息索引
      let scrollToItemIndex = -1;
      
      if (scrollToQaIndex >= 0 && qaPairs.length > scrollToQaIndex) {
        const targetPair = qaPairs[scrollToQaIndex];
        const targetUserContent = targetPair.user?.content;
        
        // 找到目标问答对在消息列表中的位置
        for (let i = 0; i < messagesToShow.length; i++) {
          const msg = messagesToShow[i];
          if (msg.role === "user" && msg.content === targetUserContent) {
            scrollToItemIndex = i;
            break;
          }
        }
      }
      
      // 渲染所有消息
      const COLLAPSE_THRESHOLD = 200; // 超过200字符时折叠
      
      for (let i = 0; i < messagesToShow.length; i++) {
        const msg = messagesToShow[i];
        if (msg.role === "system") {
          continue; // 不显示system消息
        }
        
        const item = document.createElement("div");
        item.className = "llm-reader-chat-item";

        const roleEl = document.createElement("div");
        roleEl.className = "llm-reader-chat-role";
        roleEl.textContent = "";

        const bubbleContainer = document.createElement("div");
        bubbleContainer.style.flex = "1";
        
        const bubble = document.createElement("div");
        const bubbleClass = "llm-reader-chat-bubble " +
          (msg.role === "assistant"
            ? "llm-reader-chat-bubble-assistant"
            : "llm-reader-chat-bubble-user");
        bubble.className = bubbleClass;
        bubble.innerHTML = markdownToHtml(msg.content || "");
        
        // 检查是否需要折叠（只对用户消息进行折叠）
        const textLength = (msg.content || "").length;
        const needsCollapse = msg.role === "user" && textLength > COLLAPSE_THRESHOLD;
        
        if (needsCollapse) {
          bubble.classList.add("llm-reader-chat-bubble-collapsible", "llm-reader-chat-bubble-collapsed");
          bubble.setAttribute("data-collapsed", "true");
          
          const expandBtn = document.createElement("button");
          expandBtn.className = "llm-reader-chat-expand-btn";
          expandBtn.textContent = "展开";
          expandBtn.setAttribute("aria-label", "展开完整内容");
          
          expandBtn.addEventListener("click", () => {
            const isCollapsed = bubble.getAttribute("data-collapsed") === "true";
            if (isCollapsed) {
              bubble.classList.remove("llm-reader-chat-bubble-collapsed");
              bubble.setAttribute("data-collapsed", "false");
              expandBtn.textContent = "收起";
            } else {
              bubble.classList.add("llm-reader-chat-bubble-collapsed");
              bubble.setAttribute("data-collapsed", "true");
              expandBtn.textContent = "展开";
            }
          });
          
          bubbleContainer.appendChild(bubble);
          bubbleContainer.appendChild(expandBtn);
        } else {
          bubbleContainer.appendChild(bubble);
        }

        item.appendChild(roleEl);
        item.appendChild(bubbleContainer);
        chatList.appendChild(item);
        
        // 如果这是需要滚动到的消息，添加标记以便后续滚动
        if (i === scrollToItemIndex) {
          item.setAttribute("data-scroll-target", "true");
        }
      }
      
      // 如果需要滚动到指定问答对
      if (scrollToQaIndex >= 0) {
        const scrollTarget = chatList.querySelector('[data-scroll-target="true"]');
        if (scrollTarget) {
          setTimeout(() => {
            scrollTarget.scrollIntoView({ behavior: "smooth", block: "center" });
            scrollTarget.removeAttribute("data-scroll-target");
          }, 100);
        }
      } else {
        // 如果preserveScroll为true，不自动滚动，保持当前位置
        if (!preserveScroll) {
          // 只有用户手动滚动到底部时才自动滚动
          if (shouldAutoScroll) {
            chatList.scrollTop = chatList.scrollHeight;
          }
        }
      }
    }

    // 更新导航按钮状态和显示
    function updateNavigation(preserveScroll = false) {
      qaPairs = extractQaPairs(messages);
      const totalQas = qaPairs.length;
      
      if (totalQas === 0) {
        // 没有问答对，禁用导航按钮
        prevBtn.disabled = true;
        nextBtn.disabled = true;
        currentQaIndex = -1;
        // 显示所有消息
        renderChatMessages(messages, -1, preserveScroll);
        return;
      }
      
      // 如果当前索引无效，默认显示最后一个（最新的）
      if (currentQaIndex < 0 || currentQaIndex >= totalQas) {
        currentQaIndex = totalQas - 1;
      }
      
      // 更新按钮状态
      prevBtn.disabled = currentQaIndex <= 0;
      nextBtn.disabled = currentQaIndex >= totalQas - 1;
      
      // 如果preserveScroll为true，保存当前滚动位置并在渲染后恢复
      let savedScrollTop = null;
      if (preserveScroll) {
        savedScrollTop = chatList.scrollTop;
      }
      
      // 始终显示所有消息，但高亮当前问答对
      renderChatMessages(messages, preserveScroll ? -1 : currentQaIndex, preserveScroll);
      
      // 恢复滚动位置
      if (preserveScroll && savedScrollTop !== null) {
        // 使用requestAnimationFrame确保DOM已更新
        requestAnimationFrame(() => {
          chatList.scrollTop = savedScrollTop;
        });
      }
    }

    // 导航到上一个问答
    function navigateToPrev() {
      if (currentQaIndex > 0) {
        currentQaIndex--;
        updateNavigation();
      }
    }

    // 导航到下一个问答
    function navigateToNext() {
      if (currentQaIndex < qaPairs.length - 1) {
        currentQaIndex++;
        updateNavigation();
      }
    }

    // 添加导航按钮事件监听器
    prevBtn.addEventListener("click", navigateToPrev);
    nextBtn.addEventListener("click", navigateToNext);

    function appendChatItem(role, text) {
      const item = document.createElement("div");
      item.className = "llm-reader-chat-item";

      const roleEl = document.createElement("div");
      roleEl.className = "llm-reader-chat-role";
      roleEl.textContent = "";

      const bubble = document.createElement("div");
      bubble.className =
        "llm-reader-chat-bubble " +
        (role === "assistant"
          ? "llm-reader-chat-bubble-assistant"
          : "llm-reader-chat-bubble-user");
      bubble.innerHTML = markdownToHtml(text || "");

      item.appendChild(roleEl);
      item.appendChild(bubble);

      chatList.appendChild(item);
      
      // 只有用户手动滚动到底部时才自动滚动
      if (shouldAutoScroll) {
        chatList.scrollTop = chatList.scrollHeight;
      }

      return bubble;
    }

    // 智能滚动函数：只有用户手动滚动到底部时才自动滚动
    function smartScrollToBottom() {
      if (shouldAutoScroll) {
        chatList.scrollTop = chatList.scrollHeight;
      }
    }

    // 添加滚动事件监听器来检测用户是否手动滚动到底部
    chatList.addEventListener("scroll", () => {
      const currentScrollTop = chatList.scrollTop;
      const scrollHeight = chatList.scrollHeight;
      const clientHeight = chatList.clientHeight;
      
      // 检测用户是否在底部（容差10px）
      const isAtBottom = Math.abs(scrollHeight - clientHeight - currentScrollTop) < 10;
      
      if (isAtBottom) {
        // 用户手动滚动到底部，启用自动滚动
        shouldAutoScroll = true;
      } else {
        // 用户不在底部，禁用自动滚动
        shouldAutoScroll = false;
      }
      
    });

    async function ensurePageData() {
      if (pageDataCache) return pageDataCache;
      setStatus("正在读取页面内容…");
      try {
        const res = await chrome.runtime.sendMessage({ type: "GET_PAGE_DATA" });
        if (!res?.ok) {
          throw new Error(res?.error || "获取页面内容失败。");
        }
        pageDataCache = res.pageData;
        setStatus("");
        return pageDataCache;
      } catch (e) {
        setStatus("读取页面内容失败：" + (e?.message || String(e)), true);
        throw e;
      }
    }

    function getActiveProfile() {
      const found =
        llmProfiles.find((p) => p.id === activeLlmId) || llmProfiles[0] || null;
      if (!found) {
        throw new Error("尚未配置任何 LLM 接口，请先前往设置里添加。");
      }
      return found;
    }

    async function streamChat(promptMessages, onDelta, onDone) {
      if (!llmProfiles.length) {
        await loadProfiles();
      }
      const { apiUrl, apiKey, model } = getActiveProfile();
      const endpoint = normalizeApiUrl(apiUrl);
      if (!apiUrl || !apiKey || !model) {
        throw new Error("尚未配置 API 地址 / API Key / 模型。");
      }

      const body = {
        model,
        messages: promptMessages,
        stream: true,
      };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`LLM 接口返回错误状态 ${res.status}: ${text}`);
      }

      const contentType = res.headers.get("content-type") || "";

      // 如果不是流式 SSE，就退化为一次性返回
      if (!res.body || !contentType.includes("text/event-stream")) {
        const data = await res.json().catch(() => null);
        const full =
          data?.choices?.[0]?.message?.content ??
          data?.choices?.[0]?.text ??
          JSON.stringify(data || {});
        onDelta(full, full);
        onDone(full);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let buffer = "";
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";
        for (const raw of lines) {
          const line = raw.trim();
          if (!line || !line.startsWith("data:")) continue;
          const dataStr = line.slice(5).trim();
          if (dataStr === "[DONE]") {
            onDone(fullText);
            return;
          }
          try {
            const json = JSON.parse(dataStr);
            const delta =
              json?.choices?.[0]?.delta?.content ||
              json?.choices?.[0]?.text ||
              "";
            if (delta) {
              fullText += delta;
              onDelta(delta, fullText);
            }
          } catch (e) {
            console.error("解析流式数据失败:", e, dataStr);
          }
        }
      }

      onDone(fullText);
    }

    floatBtn.addEventListener("click", () => {
      // 如果刚刚发生过拖动，则忽略这次点击，避免“拖动同时触发点击”
      if (floatWasDragged) {
        floatWasDragged = false;
        return;
      }
      panel.style.display = panel.style.display === "none" ? "flex" : "none";
    });

    function closePanel() {
      panel.style.display = "none";
    }

    closeBtn.addEventListener("click", closePanel);

    // 添加双击聊天面板关闭功能
    panel.addEventListener("dblclick", (e) => {
      // 确保双击事件不是来自可交互元素，例如输入框、按钮、选择框等
      if (
        e.target === input ||
        e.target === sendBtn ||
        e.target === analyzeBtn ||
        e.target === settingsBtn ||
        e.target === profileSelect ||
        e.target.closest(".llm-reader-input-row") ||
        e.target.closest(".llm-reader-panel-actions") ||
        e.target.closest(".llm-reader-chat-bubble")
      ) {
        return;
      }
      closePanel();
    });

    settingsBtn.addEventListener("click", () => {
      try {
        chrome.runtime.sendMessage({ type: "OPEN_OPTIONS" });
      } catch (e) {
        console.error("打开设置页失败:", e);
      }
    });

    analyzeBtn.addEventListener("click", async () => {
      if (isStreaming) return;
      isStreaming = true;
      analyzeBtn.disabled = true;
      sendBtn.disabled = true;
      input.disabled = true;
      chatList.innerHTML = "";
      messages = [];
      currentQaIndex = -1; // 重置导航索引

      try {
        const pageData = await ensurePageData();
        const titleText = pageData.title || "（无标题）";
        const urlText = pageData.url || "（无链接）";
        const bodyText = pageData.text || "（无正文内容）";

        const systemMsg = {
          role: "system",
          content:
            "你是一个帮助用户用简体中文解释网页内容的助手，需要用通俗、分点的方式总结重点。",
        };
        const userMsg = {
          role: "user",
          content: `请你阅读下面网页内容，并完成：
1）用条列的方式概括核心观点与结构
2）指出重要细节与结论
3）最后给一个三行以内的简洁总结

网页标题：${titleText}
网页链接：${urlText}

正文内容如下：
${bodyText}`,
        };

        messages = [systemMsg, userMsg];
        appendChatItem("user", "请帮我解读当前网页内容。");
        const assistantBubble = appendChatItem("assistant", "");
        setStatus("正在解读当前网页，请稍候…");

        await streamChat(
          messages,
          (delta, full) => {
            assistantBubble.innerHTML = markdownToHtml(full);
            smartScrollToBottom();
          },
          (full) => {
            messages.push({ role: "assistant", content: full });
            setStatus("解读完成，可以继续提问。");
            // 更新问答对和导航，但保持用户当前位置不变
            qaPairs = extractQaPairs(messages);
            if (qaPairs.length > 0) {
              currentQaIndex = qaPairs.length - 1;
            }
            updateNavigation(true); // preserveScroll = true，保持滚动位置
          }
        );
      } catch (e) {
        setStatus("调用失败：" + (e?.message || String(e)), true);
      } finally {
        isStreaming = false;
        analyzeBtn.disabled = false;
        sendBtn.disabled = false;
        input.disabled = false;
      }
    });

    async function sendUserMessage() {
      if (isStreaming) return;
      const text = (input.value || "").trim();
      if (!text) return;

      try {
        await ensurePageData();
      } catch {
        return;
      }

      isStreaming = true;
      sendBtn.disabled = true;
      analyzeBtn.disabled = true;
      input.disabled = true;

      // 添加用户消息到 messages
      const userMsg = { role: "user", content: text };
      messages = messages.concat(userMsg);
      
      // 显示用户消息
      appendChatItem("user", text);
      input.value = "";
      const assistantBubble = appendChatItem("assistant", "");
      setStatus("正在思考，请稍候…");

      const promptMessages = messages;

      try {
        await streamChat(
          promptMessages,
          (delta, full) => {
            assistantBubble.innerHTML = markdownToHtml(full);
            smartScrollToBottom();
          },
          (full) => {
            // promptMessages 已经包含了用户消息，只需要添加助手回复
            messages = promptMessages.concat({ role: "assistant", content: full });
            setStatus("已回复，你可以继续提问。");
            // 更新问答对和导航，但保持用户当前位置不变
            qaPairs = extractQaPairs(messages);
            if (qaPairs.length > 0) {
              currentQaIndex = qaPairs.length - 1;
            }
            updateNavigation(true); // preserveScroll = true，保持滚动位置
          }
        );
      } catch (e) {
        setStatus("调用失败：" + (e?.message || String(e)), true);
      } finally {
        isStreaming = false;
        sendBtn.disabled = false;
        analyzeBtn.disabled = false;
        input.disabled = false;
      }
    }

    sendBtn.addEventListener("click", () => {
      sendUserMessage();
    });

    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendUserMessage();
      }
    });

    // 添加文字大小控制按钮的事件监听器
    decreaseFontSizeBtn.addEventListener("click", () => {
      updateFontSize(currentFontSize - FONT_SIZE_STEP);
    });

    increaseFontSizeBtn.addEventListener("click", () => {
      updateFontSize(currentFontSize + FONT_SIZE_STEP);
    });

    // 初始化时加载配置
    loadProfiles();
    loadFontSize();
  }

  // 等文档可用后渲染
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", createOverlay, { once: true });
  } else {
    createOverlay();
  }
}


