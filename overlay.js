// overlay.js - 在网页上显示一个可展开的悬浮窗

// 防止重复注入
if (!window.__llm_reader_overlay_injected__) {
  window.__llm_reader_overlay_injected__ = true;
  
  // 加载KaTeX CSS和JS
  const librariesLoaded = {
    katex: false,
    highlight: false
  };

  function encodeLatexSource(text) {
    return encodeURIComponent(text || "");
  }

  function decodeLatexSource(text) {
    try {
      return decodeURIComponent(text || "");
    } catch {
      return text || "";
    }
  }

  function rerenderPendingMath(root = document) {
    if (!window.katex) return;

    const pendingNodes = root.querySelectorAll(".llm-reader-math-pending");
    pendingNodes.forEach((node) => {
      const source = decodeLatexSource(node.getAttribute("data-latex-source"));
      const displayMode = node.getAttribute("data-display-mode") === "true";

      try {
        const rendered = window.katex.renderToString(source, {
          displayMode,
          throwOnError: false,
          output: "html",
          strict: "warn",
          trust: false,
          fleqn: false,
          minRuleThickness: 0.06,
          maxSize: Infinity,
          maxExpand: 1000,
          macros: {
            "\\f": "#1f(#2)",
          },
        });

        node.outerHTML = displayMode
          ? `<div class="llm-reader-math-block">${rendered}</div>`
          : `<span class="llm-reader-math-inline">${rendered}</span>`;
      } catch (error) {
        console.warn("延迟渲染 LaTeX 失败:", error, source);
        node.classList.remove("llm-reader-math-pending");
        node.classList.add("latex-error");
        node.textContent = source;
      }
    });
  }
  
  (function loadLibraries() {
    // 加载KaTeX CSS
    if (!document.querySelector('link[href*="katex.min.css"]')) {
      const katexCSS = document.createElement('link');
      katexCSS.rel = 'stylesheet';
      katexCSS.href = 'https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css';
      document.head.appendChild(katexCSS);
    }
    
    // 加载KaTeX JS（不使用defer，确保同步加载）
    if (!document.querySelector('script[src*="katex.min.js"]')) {
      const katexScript = document.createElement('script');
      katexScript.src = 'https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.js';
      katexScript.onload = () => {
        librariesLoaded.katex = true;
        console.log('KaTeX库加载成功');
        rerenderPendingMath(document);
      };
      katexScript.onerror = () => {
        console.error('KaTeX库加载失败');
      };
      document.head.appendChild(katexScript);
    } else {
      librariesLoaded.katex = true;
      queueMicrotask(() => rerenderPendingMath(document));
    }
    
    // 加载highlight.js CSS - VSCode风格
    if (!document.querySelector('link[href*="vscode.min.css"]')) {
      const highlightCSS = document.createElement('link');
      highlightCSS.rel = 'stylesheet';
      highlightCSS.href = 'https://cdn.jsdelivr.net/npm/highlight.js@11.9.0/styles/vscode.min.css';
      document.head.appendChild(highlightCSS);
    }
    
    // 加载highlight.js JS
    if (!document.querySelector('script[src*="highlight.min.js"]')) {
      const highlightScript = document.createElement('script');
      highlightScript.src = 'https://cdn.jsdelivr.net/npm/highlight.js@11.9.0/lib/common.min.js';
      highlightScript.onload = () => {
        librariesLoaded.highlight = true;
        console.log('highlight.js库加载成功');
      };
      highlightScript.onerror = () => {
        console.error('highlight.js库加载失败');
      };
      document.head.appendChild(highlightScript);
    } else {
      librariesLoaded.highlight = true;
    }
  })();

  const STYLE_ID = "__llm_reader_overlay_style__";
  
  // 多语言辅助函数
  const t = window.__llm_reader_t__ || ((key) => key);
  let currentLang = "zh-CN";
  
  // 获取当前语言设置
  async function loadLanguage() {
    try {
      const data = await chrome.storage.sync.get("language");
      currentLang = data.language || "zh-CN";
    } catch (e) {
      console.error("加载语言设置失败:", e);
      currentLang = "zh-CN";
    }
    return currentLang;
  }

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
        --llm-reader-analyze-btn-font-size: 13px;
        --llm-reader-profile-select-font-size: 13px;
        --llm-reader-user-input-font-size: 13px;
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
        min-width: 420px;
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

      .llm-reader-panel.llm-reader-panel-pdf {
        width: min(46vw, 760px);
        min-width: 560px;
        right: 1.5%;
      }

      .llm-reader-panel-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 8px 10px 6px;
        border-bottom: 1px solid rgba(0, 0, 0, 0.06);
        cursor: move;
        background: #f8f9fa;
      }

      .llm-reader-panel-title {
        font-size: var(--llm-reader-title-font-size);
        font-weight: 400;
      }

      .llm-reader-panel-actions {
        display: flex;
        align-items: center;
        gap: 4px;
        flex-wrap: nowrap;
        justify-content: flex-end;
        min-width: 0;
        overflow: hidden;
      }

      .llm-reader-actions-group {
        display: inline-flex;
        align-items: center;
        gap: 2px;
        padding: 2px 4px;
        border-radius: 999px;
        background: #f3f4f6;
        border: 1px solid #e5e7eb;
        flex-shrink: 0;
        min-width: 0;
      }

      .llm-reader-profile-select {
        min-width: 80px;
        max-width: 140px;
        padding: 2px 4px;
        border-radius: 999px;
        border: 1px solid #dadce0;
        background: #ffffff;
        color: #202124;
        font-size: var(--llm-reader-profile-select-font-size);
        outline: none;
        cursor: pointer;
        flex-shrink: 0;
      }

      .llm-reader-btn {
        border-radius: 999px;
        padding: 2px 6px;
        border: 1px solid #dadce0;
        background: #ffffff;
        color: #1f2933;
        font-size: var(--llm-reader-btn-font-size);
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 2px;
        white-space: nowrap;
        flex-shrink: 0;
        min-width: 12px;
        box-sizing: border-box;
      }

      .llm-reader-btn:hover {
        background: #f6f9fe;
        border-color: #1a73e8;
      }

      .llm-reader-settings-btn {
        background: transparent;
        border: none;
        padding: 2px 6px;
        font-size: 12px;
        line-height: 1;
        cursor: pointer;
        opacity: 0.7;
        transition: opacity 0.15s ease;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 2px;
        white-space: nowrap;
        flex-shrink: 0;
        min-width: 12px;
        box-sizing: border-box;
        border-radius: 999px;
        border: 1px solid #dadce0;
        background: #ffffff;
        color: #1f2933;
      }

      .llm-reader-settings-btn:hover {
        opacity: 1;
        background: #f6f9fe;
        border-color: #1a73e8;
      }

      .llm-reader-settings-btn:hover span {
        display: inline-block;
        transform: rotate(30deg);
        transition: transform 0.15s ease;
      }

      .llm-reader-close {
        border-radius: 999px;
        width: 28px;
        height: 28px;
        border: none;
        background: transparent;
        color: #5f6368;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: var(--llm-reader-close-font-size);
        box-sizing: border-box;
      }

      .llm-reader-font-size-controls {
        display: flex;
        align-items: center;
        gap: 2px;
        margin-left: 0;
        flex-shrink: 0;
      }

      .llm-reader-font-size-btn {
        width: 18px;
        height: 18px;
        border-radius: 50%;
        border: 1px solid #dadce0;
        background: #ffffff;
        color: #1f2933;
        font-size: 12px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        line-height: 1;
        flex-shrink: 0;
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
        padding: 6px 8px 8px;
        display: flex;
        flex-direction: column;
        gap: 4px;
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
        white-space: normal;
        word-wrap: break-word;
        word-break: break-word;
        overflow-wrap: break-word;
        line-height: 1.6;
      }

      .llm-reader-chat-bubble p {
        margin: 0 0 0.7em;
      }

      .llm-reader-chat-bubble p:last-child {
        margin-bottom: 0;
      }

      .llm-reader-chat-bubble ul,
      .llm-reader-chat-bubble ol {
        margin: 0.4em 0 0.85em 1.3em;
        padding: 0;
      }

      .llm-reader-chat-bubble li {
        margin: 0.22em 0;
        padding-left: 0.1em;
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
      
      .llm-reader-chat-bubble .katex {
        font-size: 1.08em;
        line-height: 1.2;
        text-rendering: auto;
      }


      .llm-reader-chat-bubble .llm-reader-math-inline {
        display: inline-block;
        max-width: 100%;
        padding: 0.08em 0.2em;
        margin: 0 0.08em;
        border-radius: 4px;
        vertical-align: -0.18em;
        overflow-x: auto;
        overflow-y: hidden;
        white-space: nowrap;
        scrollbar-width: thin;
      }

      .llm-reader-chat-bubble .llm-reader-math-pending {
        font-family: "KaTeX_Main", "Times New Roman", serif;
      }

      .llm-reader-chat-bubble .llm-reader-math-inline::-webkit-scrollbar,
      .llm-reader-chat-bubble .llm-reader-math-block::-webkit-scrollbar {
        height: 6px;
      }

      .llm-reader-chat-bubble .llm-reader-math-inline::-webkit-scrollbar-thumb,
      .llm-reader-chat-bubble .llm-reader-math-block::-webkit-scrollbar-thumb {
        background: rgba(148, 163, 184, 0.55);
        border-radius: 999px;
      }

      .llm-reader-chat-bubble .llm-reader-math-block {
        display: block;
        max-width: 100%;
        margin: 0.95em 0;
        padding: 0.9em 1em;
        border: 1px solid #e6eaf0;
        border-radius: 10px;
        background: linear-gradient(180deg, #fbfdff 0%, #f4f8fc 100%);
        overflow-x: auto;
        overflow-y: hidden;
        box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.7);
      }

      .llm-reader-chat-bubble .llm-reader-math-block .katex-display {
        margin: 0;
        padding: 0;
        overflow: visible hidden;
      }

      .llm-reader-chat-bubble .llm-reader-math-block .katex {
        font-size: 1.16em;
      }

      .llm-reader-chat-bubble .latex-fallback,
      .llm-reader-chat-bubble .latex-error {
        display: block;
        margin: 0.95em 0;
        padding: 0.75em 0.9em;
        border: 1px solid #e0e0e0;
        border-radius: 8px;
        background: #f8fafc;
        font-family: 'Computer Modern', 'Latin Modern Math', 'KaTeX_Math', serif;
        font-size: 0.95em;
        color: #111827;
        white-space: pre-wrap;
        overflow-x: auto;
      }

      .llm-reader-chat-bubble .llm-reader-math-inline.latex-fallback,
      .llm-reader-chat-bubble .llm-reader-math-inline.latex-error,
      .llm-reader-chat-bubble .llm-reader-math-inline.llm-reader-math-pending {
        display: inline-block;
        margin: 0 0.12em;
        padding: 0.08em 0.28em;
        vertical-align: -0.18em;
        white-space: nowrap;
      }

      .llm-reader-chat-bubble .latex-error {
        border-color: #f5c2c7;
        background: #fff5f5;
        color: #b42318;
      }

      .llm-reader-chat-bubble .llm-reader-math-inline .katex,
      .llm-reader-chat-bubble .llm-reader-math-inline .katex *,
      .llm-reader-chat-bubble .llm-reader-math-block .katex,
      .llm-reader-chat-bubble .llm-reader-math-block .katex * {
        white-space: nowrap !important;
        word-break: normal !important;
        overflow-wrap: normal !important;
      }
      
      /* VSCode风格的代码块样式 */
      .llm-reader-chat-bubble pre {
        background: #1e1e1e;
        border: 1px solid #3c3c3c;
        border-radius: 4px;
        padding: 12px;
        margin: 8px 0;
        overflow-x: auto;
        font-family: Consolas, 'Courier New', 'Monaco', 'Andale Mono', 'Ubuntu Mono', monospace;
        font-size: 13px;
        line-height: 1.4;
        color: #d4d4d4;
      }
      
      .llm-reader-chat-bubble pre code {
        background: none;
        border: none;
        padding: 0;
        font-size: inherit;
        font-family: inherit;
        color: inherit;
      }
      
      .llm-reader-chat-bubble code {
        background: #1e1e1e;
        border: 1px solid #3c3c3c;
        border-radius: 3px;
        padding: 2px 6px;
        font-family: Consolas, 'Courier New', 'Monaco', 'Andale Mono', 'Ubuntu Mono', monospace;
        font-size: 12px;
        color: #9cdcfe;
      }
      
      /* VSCode风格的语法高亮覆盖 */
      .llm-reader-chat-bubble .hljs {
        background: #1e1e1e !important;
        color: #d4d4d4 !important;
        padding: 0 !important;
        border-radius: 0 !important;
      }
      
      .llm-reader-chat-bubble .hljs-keyword {
        color: #569cd6 !important;
      }
      
      .llm-reader-chat-bubble .hljs-string {
        color: #ce9178 !important;
      }
      
      .llm-reader-chat-bubble .hljs-number {
        color: #b5cea8 !important;
      }
      
      .llm-reader-chat-bubble .hljs-comment {
        color: #6a9955 !important;
        font-style: italic;
      }
      
      .llm-reader-chat-bubble .hljs-function {
        color: #dcdcaa !important;
      }
      
      .llm-reader-chat-bubble .hljs-variable {
        color: #9cdcfe !important;
      }
      
      .llm-reader-chat-bubble .hljs-operator {
        color: #d4d4d4 !important;
      }
      
      .llm-reader-chat-bubble .hljs-class {
        color: #4ec9b0 !important;
      }
      
      .llm-reader-chat-bubble .hljs-property {
        color: #9cdcfe !important;
      }
      
      .llm-reader-chat-bubble .hljs-tag {
        color: #569cd6 !important;
      }
      
      .llm-reader-chat-bubble .hljs-attr {
        color: #9cdcfe !important;
      }
      
      .llm-reader-chat-bubble .hljs-title {
        color: #dcdcaa !important;
      }
      
      .llm-reader-chat-bubble .hljs-params {
        color: #9cdcfe !important;
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
        align-items: center;
        gap: 4px;
        margin-top: 2px;
      }

      .llm-reader-input {
        flex: 1;
        min-height: 28px;
        max-height: 80px;
        resize: none;
        border-radius: 6px;
        border: 1px solid #dadce0;
        background: #ffffff;
        color: #202124;
        padding: 4px 6px;
        font-size: var(--llm-reader-user-input-font-size);
        box-sizing: border-box;
      }

      .llm-reader-input::placeholder {
        color: #9aa0a6;
      }

      .llm-reader-send-btn {
        border-radius: 999px;
        padding: 4px 8px;
        border: none;
        background: #1a73e8;
        color: #ffffff;
        font-size: 11px;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 3px;
        white-space: nowrap;
        min-width: 15px;
        box-sizing: border-box;
      }

      .llm-reader-send-btn:disabled {
        opacity: 0.6;
        cursor: default;
        box-shadow: none;
      }

      .llm-reader-pause-btn {
        border-radius: 999px;
        padding: 4px 8px;
        border: none;
        background: #d93025;
        color: #ffffff;
        font-size: 11px;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 3px;
        white-space: nowrap;
        min-width: 15px;
        box-sizing: border-box;
      }

      .llm-reader-pause-btn:hover {
        background: #b6281e;
      }

      .llm-reader-pause-btn:disabled {
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
        gap: 2px;
        margin-left: 0;
        flex-shrink: 0;
      }

      .llm-reader-nav-btn {
        width: 20px;
        height: 20px;
        border-radius: 50%;
        border: 1px solid #dadce0;
        background: #ffffff;
        color: #1f2933;
        font-size: 10px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        line-height: 1;
        padding: 0;
        flex-shrink: 0;
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

      /* Settings Panel Styles */
      .llm-reader-settings-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        z-index: 2147483647;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        visibility: hidden;
        transition: opacity 0.2s ease, visibility 0.2s ease;
      }

      .llm-reader-settings-overlay.visible {
        opacity: 1;
        visibility: visible;
      }

      .llm-reader-settings-panel {
        width: 420px;
        max-width: 90vw;
        max-height: 85vh;
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
        transform: scale(0.95);
        transition: transform 0.2s ease;
      }

      .llm-reader-settings-overlay.visible .llm-reader-settings-panel {
        transform: scale(1);
      }

      .llm-reader-settings-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 14px 16px 12px;
        border-bottom: 1px solid rgba(0, 0, 0, 0.06);
        background: #f8f9fa;
      }

      .llm-reader-settings-title {
        font-size: 15px;
        font-weight: 500;
        color: #202124;
      }

      .llm-reader-settings-close {
        width: 28px;
        height: 28px;
        border-radius: 50%;
        border: none;
        background: transparent;
        color: #5f6368;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 18px;
        transition: background 0.15s ease;
      }

      .llm-reader-settings-close:hover {
        background: rgba(0, 0, 0, 0.06);
      }

      .llm-reader-settings-body {
        padding: 16px;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        gap: 14px;
      }

      .llm-reader-settings-section {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }

      .llm-reader-settings-section-title {
        font-size: 12px;
        font-weight: 500;
        color: #5f6368;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .llm-reader-settings-field {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .llm-reader-settings-label {
        font-size: 12px;
        color: #5f6368;
      }

      .llm-reader-settings-input,
      .llm-reader-settings-select {
        padding: 8px 10px;
        border-radius: 6px;
        border: 1px solid #dadce0;
        background: #ffffff;
        color: #202124;
        font-size: 13px;
        outline: none;
        transition: border-color 0.15s ease, box-shadow 0.15s ease;
      }

      .llm-reader-settings-input:focus,
      .llm-reader-settings-select:focus {
        border-color: #1a73e8;
        box-shadow: 0 0 0 2px rgba(26, 115, 232, 0.2);
      }

      .llm-reader-settings-input::placeholder {
        color: #9aa0a6;
      }

      .llm-reader-settings-profile-row {
        display: flex;
        gap: 8px;
        align-items: center;
      }

      .llm-reader-settings-profile-select {
        flex: 1;
        padding: 8px 10px;
        border-radius: 6px;
        border: 1px solid #dadce0;
        background: #ffffff;
        color: #202124;
        font-size: 13px;
        outline: none;
        cursor: pointer;
      }

      .llm-reader-settings-btn-small {
        padding: 6px 12px;
        border-radius: 6px;
        border: 1px solid #dadce0;
        background: #ffffff;
        color: #202124;
        font-size: 12px;
        cursor: pointer;
        white-space: nowrap;
        transition: background 0.15s ease, border-color 0.15s ease;
      }

      .llm-reader-settings-btn-small:hover {
        background: #f6f9fe;
        border-color: #1a73e8;
      }

      .llm-reader-settings-btn-small.danger {
        color: #d93025;
        border-color: #d93025;
      }

      .llm-reader-settings-btn-small.danger:hover {
        background: #fce8e6;
      }

      .llm-reader-settings-footer {
        display: flex;
        justify-content: flex-end;
        gap: 10px;
        padding: 12px 16px;
        border-top: 1px solid rgba(0, 0, 0, 0.06);
        background: #f8f9fa;
      }

      .llm-reader-settings-btn-primary {
        padding: 8px 20px;
        border-radius: 6px;
        border: none;
        background: #1a73e8;
        color: #ffffff;
        font-size: 13px;
        font-weight: 500;
        cursor: pointer;
        transition: background 0.15s ease, box-shadow 0.15s ease;
      }

      .llm-reader-settings-btn-primary:hover {
        background: #1557b0;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
      }

      .llm-reader-settings-btn-secondary {
        padding: 8px 20px;
        border-radius: 6px;
        border: 1px solid #dadce0;
        background: #ffffff;
        color: #5f6368;
        font-size: 13px;
        cursor: pointer;
        transition: background 0.15s ease;
      }

      .llm-reader-settings-btn-secondary:hover {
        background: #f1f3f4;
      }

      .llm-reader-settings-status {
        font-size: 12px;
        color: #5f6368;
        min-height: 18px;
        text-align: center;
      }

      .llm-reader-settings-status.error {
        color: #d93025;
      }

      .llm-reader-settings-status.success {
        color: #1e8e3e;
      }

      /* History Panel Styles */
      .llm-reader-history-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        z-index: 2147483647;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        visibility: hidden;
        transition: opacity 0.2s ease, visibility 0.2s ease;
      }

      .llm-reader-history-overlay.visible {
        opacity: 1;
        visibility: visible;
      }

      .llm-reader-history-panel {
        width: 600px;
        max-width: 90vw;
        max-height: 80vh;
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
        transform: scale(0.95);
        transition: transform 0.2s ease;
      }

      .llm-reader-history-overlay.visible .llm-reader-history-panel {
        transform: scale(1);
      }

      .llm-reader-history-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 14px 16px 12px;
        border-bottom: 1px solid rgba(0, 0, 0, 0.06);
        background: #f8f9fa;
      }

      .llm-reader-history-title {
        font-size: 15px;
        font-weight: 500;
        color: #202124;
      }

      .llm-reader-history-close {
        width: 28px;
        height: 28px;
        border-radius: 50%;
        border: none;
        background: transparent;
        color: #5f6368;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 18px;
        transition: background 0.15s ease;
      }

      .llm-reader-history-close:hover {
        background: rgba(0, 0, 0, 0.06);
      }

      .llm-reader-history-search {
        padding: 12px 16px;
        border-bottom: 1px solid rgba(0, 0, 0, 0.06);
      }

      .llm-reader-history-search-input {
        width: 100%;
        padding: 8px 12px;
        border-radius: 6px;
        border: 1px solid #dadce0;
        background: #ffffff;
        color: #202124;
        font-size: 13px;
        outline: none;
        box-sizing: border-box;
      }

      .llm-reader-history-search-input:focus {
        border-color: #1a73e8;
        box-shadow: 0 0 0 2px rgba(26, 115, 232, 0.2);
      }

      .llm-reader-history-list {
        flex: 1;
        overflow-y: auto;
        padding: 8px;
      }

      .llm-reader-history-item {
        padding: 12px;
        border-radius: 8px;
        border: 1px solid #e0e0e0;
        background: #ffffff;
        margin-bottom: 8px;
        cursor: pointer;
        transition: background 0.15s ease, border-color 0.15s ease;
      }

      .llm-reader-history-item:hover {
        background: #f8f9fa;
        border-color: #1a73e8;
      }

      .llm-reader-history-item-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 6px;
      }

      .llm-reader-history-item-title {
        font-size: 14px;
        font-weight: 500;
        color: #202124;
        flex: 1;
        margin-right: 8px;
        line-height: 1.3;
      }

      .llm-reader-history-item-date {
        font-size: 11px;
        color: #5f6368;
        white-space: nowrap;
      }

      .llm-reader-history-item-meta {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 4px;
        font-size: 11px;
        color: #5f6368;
      }

      .llm-reader-history-item-url {
        color: #1a73e8;
        text-decoration: none;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 200px;
      }

      .llm-reader-history-item-url:hover {
        text-decoration: underline;
      }

      .llm-reader-history-item-preview {
        font-size: 12px;
        color: #5f6368;
        line-height: 1.4;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }

      .llm-reader-history-item-actions {
        display: flex;
        gap: 8px;
        margin-top: 8px;
      }

      .llm-reader-history-btn-small {
        padding: 4px 8px;
        border-radius: 4px;
        border: 1px solid #dadce0;
        background: #ffffff;
        color: #5f6368;
        font-size: 11px;
        cursor: pointer;
        transition: background 0.15s ease, border-color 0.15s ease;
      }

      .llm-reader-history-btn-small:hover {
        background: #f6f9fe;
        border-color: #1a73e8;
        color: #1a73e8;
      }

      .llm-reader-history-btn-small.danger {
        color: #d93025;
        border-color: #d93025;
      }

      .llm-reader-history-btn-small.danger:hover {
        background: #fce8e6;
      }

      .llm-reader-history-empty {
        text-align: center;
        padding: 40px 20px;
        color: #5f6368;
        font-size: 14px;
      }

      .llm-reader-history-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 16px;
        border-top: 1px solid rgba(0, 0, 0, 0.06);
        background: #f8f9fa;
      }

      .llm-reader-history-count {
        font-size: 12px;
        color: #5f6368;
      }

      .llm-reader-history-clear-btn {
        padding: 6px 12px;
        border-radius: 6px;
        border: 1px solid #d93025;
        background: #ffffff;
        color: #d93025;
        font-size: 12px;
        cursor: pointer;
        transition: background 0.15s ease;
      }

      .llm-reader-history-clear-btn:hover {
        background: #fce8e6;
      }
    `;
    document.head.appendChild(style);
  }

  function createOverlay() {
    injectStyle();

    function isPdfPage() {
      const href = location.href || "";
      const pathname = location.pathname || "";
      const contentType = document.contentType || "";
      const hasPdfEmbed = !!document.querySelector('embed[type="application/pdf"], iframe[src*=".pdf"], object[type="application/pdf"]');
      return (
        pathname.toLowerCase().endsWith(".pdf") ||
        href.toLowerCase().includes(".pdf") ||
        contentType === "application/pdf" ||
        hasPdfEmbed
      );
    }

    const pdfMode = isPdfPage();

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
    if (pdfMode) {
      panel.classList.add("llm-reader-panel-pdf");
    }
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
    analyzeBtn.style.fontSize = "var(--llm-reader-analyze-btn-font-size)";
    analyzeBtn.textContent = t("overlay_analyze_btn", currentLang);

    const historyBtn = document.createElement("button");
    historyBtn.className = "llm-reader-settings-btn";
    historyBtn.title = t("overlay_history_btn", currentLang);
    
    const historyIcon = document.createElement("span");
    historyIcon.textContent = "📚";
    historyBtn.appendChild(historyIcon);

    const settingsBtn = document.createElement("button");
    settingsBtn.className = "llm-reader-settings-btn";
    settingsBtn.title = t("overlay_settings_btn", currentLang);
    
    const settingsIcon = document.createElement("span");
    settingsIcon.textContent = "⚙️";
    settingsBtn.appendChild(settingsIcon);

    const closeBtn = document.createElement("button");
    closeBtn.className = "llm-reader-close";
    closeBtn.textContent = "×";

    // 文字大小控制按钮
    const fontSizeControls = document.createElement("div");
    fontSizeControls.className = "llm-reader-font-size-controls";

    const decreaseFontSizeBtn = document.createElement("button");
    decreaseFontSizeBtn.className = "llm-reader-font-size-btn";
    decreaseFontSizeBtn.textContent = "−";
    decreaseFontSizeBtn.title = t("overlay_decrease_font", currentLang);

    const increaseFontSizeBtn = document.createElement("button");
    increaseFontSizeBtn.className = "llm-reader-font-size-btn";
    increaseFontSizeBtn.textContent = "+";
    increaseFontSizeBtn.title = t("overlay_increase_font", currentLang);

    fontSizeControls.appendChild(decreaseFontSizeBtn);
    fontSizeControls.appendChild(increaseFontSizeBtn);

    // 导航控制按钮
    const navigationControls = document.createElement("div");
    navigationControls.className = "llm-reader-navigation-controls";

    const prevBtn = document.createElement("button");
    prevBtn.className = "llm-reader-nav-btn";
    prevBtn.textContent = "↑";
    prevBtn.title = t("overlay_prev_qa", currentLang);
    prevBtn.disabled = true;

    const nextBtn = document.createElement("button");
    nextBtn.className = "llm-reader-nav-btn";
    nextBtn.textContent = "↓";
    nextBtn.title = t("overlay_next_qa", currentLang);
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
    utilityActionsGroup.appendChild(historyBtn);
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
    input.placeholder = t("overlay_input_placeholder", currentLang);

    const sendBtn = document.createElement("button");
    sendBtn.className = "llm-reader-send-btn";
    sendBtn.textContent = t("overlay_send_btn", currentLang);

    const pauseBtn = document.createElement("button");
    pauseBtn.className = "llm-reader-pause-btn";
    pauseBtn.textContent = t("overlay_pause_btn", currentLang);
    pauseBtn.style.display = "none"; // 默认隐藏，只有流式时才显示

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
    inputRow.appendChild(pauseBtn);

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
    
    // 暂停功能相关变量
    let currentAbortController = null;
    let isPaused = false;
    
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
    let currentFontSize = pdfMode ? 15 : 12; // PDF 页面默认更大
    const MIN_FONT_SIZE = pdfMode ? 13 : 10;
    const MAX_FONT_SIZE = pdfMode ? 24 : 20;
    const FONT_SIZE_STEP = 1;

    // 问答导航相关变量
    let currentQaIndex = -1; // 当前显示的问答索引，-1表示显示全部
    let qaPairs = []; // 问答对数组

    // 双击快捷键相关变量
    let lastKeyPress = null;
    let lastKeyTime = 0;
    const DOUBLE_KEY_INTERVAL = 500; // 双击时间间隔（毫秒）

    // 切换面板显示
    function togglePanel() {
      panel.style.display = panel.style.display === "none" ? "flex" : "none";
    }

    // 将面板居中
    function centerPanel() {
      const viewportWidth = window.innerWidth || document.documentElement.clientWidth;
      const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
      const panelRect = panel.getBoundingClientRect();
      const panelWidth = panelRect.width || 420; // 默认宽度
      const panelHeight = panelRect.height || 600; // 默认高度
      
      const newLeft = Math.max(0, (viewportWidth - panelWidth) / 2);
      const newTop = Math.max(0, (viewportHeight - panelHeight) / 2);
      
      // 设置为绝对定位并居中
      hasCustomPos = true;
      panel.style.transform = "none";
      panel.style.left = newLeft + "px";
      panel.style.top = newTop + "px";
      panel.style.right = "auto";
      panel.style.bottom = "auto";
      
      // 显示状态提示
      setStatus(t("overlay_panel_centered", currentLang) || "面板已居中");
      setTimeout(() => setStatus(""), 1500);
    }

    // 初始化双击快捷键监听
    function initDoubleKeyListener() {
      document.addEventListener("keydown", (e) => {
        // 如果用户在输入框中打字，不触发快捷键
        if (e.target === input || e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") {
          return;
        }
        
        const currentTime = Date.now();
        const key = e.key.toLowerCase();
        
        // 检查是否是双击 b 或 v
        if (key === lastKeyPress && (currentTime - lastKeyTime) < DOUBLE_KEY_INTERVAL) {
          if (key === "b") {
            // 双击 b：弹出/隐藏聊天框
            togglePanel();
            e.preventDefault();
          } else if (key === "v") {
            // 双击 v：居中聊天框
            if (panel.style.display !== "none") {
              centerPanel();
              e.preventDefault();
            }
          }
          // 重置，避免三次按键触发
          lastKeyPress = null;
          lastKeyTime = 0;
        } else {
          // 记录这次按键
          lastKeyPress = key;
          lastKeyTime = currentTime;
        }
      });
    }

    function updateFontSize(newSize) {
      // 确保文字大小在允许范围内
      newSize = Math.max(MIN_FONT_SIZE, Math.min(MAX_FONT_SIZE, newSize));
      
      if (newSize === currentFontSize) return; // 没有变化，直接返回
      
      currentFontSize = newSize;
      
      // 更新CSS变量（排除解读本页按钮和模型选择框）
      document.documentElement.style.setProperty('--llm-reader-base-font-size', currentFontSize + 'px');
      document.documentElement.style.setProperty('--llm-reader-title-font-size', (currentFontSize + 1) + 'px');
      document.documentElement.style.setProperty('--llm-reader-input-font-size', currentFontSize + 'px');
      document.documentElement.style.setProperty('--llm-reader-chat-font-size', currentFontSize + 'px');
      document.documentElement.style.setProperty('--llm-reader-status-font-size', (currentFontSize - 1) + 'px');
      document.documentElement.style.setProperty('--llm-reader-btn-font-size', (currentFontSize - 1) + 'px');
      document.documentElement.style.setProperty('--llm-reader-select-font-size', (currentFontSize - 1) + 'px');
      document.documentElement.style.setProperty('--llm-reader-close-font-size', currentFontSize + 'px');
      document.documentElement.style.setProperty('--llm-reader-role-font-size', (currentFontSize - 1) + 'px');
      
      // 保持解读本页按钮、模型选择框和用户输入框字体大小不变
      document.documentElement.style.setProperty('--llm-reader-analyze-btn-font-size', '13px');
      document.documentElement.style.setProperty('--llm-reader-profile-select-font-size', '13px');
      document.documentElement.style.setProperty('--llm-reader-user-input-font-size', '13px');
      
      // 更新按钮状态
      decreaseFontSizeBtn.disabled = currentFontSize <= MIN_FONT_SIZE;
      increaseFontSizeBtn.disabled = currentFontSize >= MAX_FONT_SIZE;
      
      // 保存到存储
      chrome.storage.sync.set({ fontSize: currentFontSize });
      
      // 显示状态提示
      setStatus(`${t("overlay_font_size", currentLang)}: ${currentFontSize}px`);
      const fontSizeTimeout = setTimeout(() => setStatus(""), 1500);
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
      
      // 确保解读本页按钮、模型选择框和用户输入框字体大小始终固定
      document.documentElement.style.setProperty('--llm-reader-analyze-btn-font-size', '13px');
      document.documentElement.style.setProperty('--llm-reader-profile-select-font-size', '13px');
      document.documentElement.style.setProperty('--llm-reader-user-input-font-size', '13px');
    }

    function setStatus(text, isError = false) {
      status.textContent = text || "";
      status.style.color = isError ? "#f97373" : "#9ca3af";
      status.style.fontSize = "13px"; // 与"解读本页"按钮字体大小一致
    }

    // 增强的 Markdown 渲染（支持 LaTeX 公式和代码高亮）
    function escapeHtml(str) {
      return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
    }

    // 渲染LaTeX公式的辅助函数
    function renderLatex(text, displayMode = false) {
      const encodedSource = encodeLatexSource(text);
      try {
        if (typeof window.katex !== 'undefined' && window.katex) {
          const rendered = window.katex.renderToString(text, {
            displayMode: displayMode,
            throwOnError: false,
            output: 'html',
            strict: 'warn',
            trust: false,
            fleqn: false,
            minRuleThickness: 0.06,
            maxSize: Infinity,
            maxExpand: 1000,
            macros: {
              "\\f": "#1f(#2)",
            }
          });
          
          if (!displayMode) {
            return `<span class="llm-reader-math-inline">${rendered}</span>`;
          }
          return `<div class="llm-reader-math-block">${rendered}</div>`;
        } else {
          console.warn('KaTeX库未加载，显示原始LaTeX:', text);
          const tagName = displayMode ? "div" : "span";
          const className = displayMode
            ? "llm-reader-math-block llm-reader-math-pending"
            : "llm-reader-math-inline llm-reader-math-pending";
          return `<${tagName} class="${className}" data-latex-source="${encodedSource}" data-display-mode="${displayMode}">${escapeHtml(text)}</${tagName}>`;
        }
      } catch (e) {
        console.warn('LaTeX渲染失败:', e, text);
        const tagName = displayMode ? "div" : "span";
        return `<${tagName} class="latex-error">${escapeHtml(text)}</${tagName}>`;
      }
    }

    // 渲染代码块的辅助函数
    function renderCodeBlock(code, language = '') {
      try {
        if (window.hljs) {
          // 尝试检测语言
          let lang = language.toLowerCase().trim();
          if (!lang || lang === 'text' || lang === 'plain') {
            const result = window.hljs.highlightAuto(code);
            return `<pre><code class="hljs">${result.value}</code></pre>`;
          }
          
          // 尝试使用指定语言高亮
          try {
            const result = window.hljs.highlight(code, { language: lang });
            return `<pre><code class="hljs language-${lang}">${result.value}</code></pre>`;
          } catch (e) {
            // 如果指定语言失败，自动检测
            const result = window.hljs.highlightAuto(code);
            return `<pre><code class="hljs">${result.value}</code></pre>`;
          }
        } else {
          // 如果highlight.js未加载，显示原始代码
          return `<pre><code>${escapeHtml(code)}</code></pre>`;
        }
      } catch (e) {
        console.warn('代码高亮失败:', e);
        return `<pre><code>${escapeHtml(code)}</code></pre>`;
      }
    }

    function markdownToHtml(md) {
      if (!md) return "";

      // 临时存储LaTeX公式和代码块
      const latexBlocks = [];
      const codeBlocks = [];
      
      // 先处理代码块，避免代码块中的$符号被误识别为LaTeX
      const parts = md.split(/```/);
      let processedMd = "";
      
      parts.forEach((part, index) => {
        if (index % 2 === 1) {
          // 代码块 - 直接保存，不处理LaTeX
          const lines = part.split('\n');
          let language = '';
          let code = part;
          
          // 检查第一行是否为语言标识符
          if (lines.length > 1 && /^[a-zA-Z0-9_-]+$/.test(lines[0].trim())) {
            language = lines[0].trim();
            code = lines.slice(1).join('\n');
          }
          
          code = code.replace(/^\s+|\s+$/g, "");
          const codeIndex = codeBlocks.length;
          codeBlocks.push({ code: code, language: language });
          processedMd += `__CODE_BLOCK_${codeIndex}__`;
        } else {
          // 非代码块部分 - 提取LaTeX公式
          let text = part;
          
          // 提取LaTeX公式（块级） - 必须在行内公式之前处理
          text = text.replace(/\$\$([\s\S]*?)\$\$/g, (match, content) => {
            const index = latexBlocks.length;
            latexBlocks.push({ content: content.trim(), displayMode: true });
            return `__LATEX_BLOCK_${index}__`;
          });

          text = text.replace(/\\\[((?:.|\n)*?)\\\]/g, (match, content) => {
            const index = latexBlocks.length;
            latexBlocks.push({ content: content.trim(), displayMode: true });
            return `__LATEX_BLOCK_${index}__`;
          });
          
          // 提取LaTeX公式（行内）
          text = text.replace(/\$([^\$\n]+?)\$/g, (match, content) => {
            const index = latexBlocks.length;
            latexBlocks.push({ content: content.trim(), displayMode: false });
            return `__LATEX_INLINE_${index}__`;
          });

          text = text.replace(/\\\((.+?)\\\)/g, (match, content) => {
            const index = latexBlocks.length;
            latexBlocks.push({ content: content.trim(), displayMode: false });
            return `__LATEX_INLINE_${index}__`;
          });
          
          processedMd += text;
        }
      });
      
      function renderInlineMarkdown(text) {
        if (!text) return "";

        let html = escapeHtml(text);
        html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
        html = html.replace(/`([^`]+)`/g, (match, code) => {
          if (code.match(/^__LATEX_INLINE_\d+__$/)) {
            return match;
          }
          return `<code>${code}</code>`;
        });
        html = html.replace(
          /(https?:\/\/[^\s<]+)/g,
          '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>'
        );
        return html;
      }

      function renderTextSegment(segment) {
        const lines = segment.split("\n");
        const htmlParts = [];
        let paragraphBuffer = [];
        let listItems = [];
        let listType = null;

        function flushParagraph() {
          if (!paragraphBuffer.length) return;
          htmlParts.push(`<p>${renderInlineMarkdown(paragraphBuffer.join("<br>"))}</p>`);
          paragraphBuffer = [];
        }

        function flushList() {
          if (!listItems.length || !listType) return;
          const itemsHtml = listItems
            .map((item) => `<li>${renderInlineMarkdown(item)}</li>`)
            .join("");
          htmlParts.push(`<${listType}>${itemsHtml}</${listType}>`);
          listItems = [];
          listType = null;
        }

        lines.forEach((rawLine) => {
          const line = rawLine.trimEnd();
          const trimmed = line.trim();

          if (!trimmed) {
            flushParagraph();
            flushList();
            return;
          }

          const titleMatch = trimmed.match(/^(#{1,6})\s+(.+?)\s*$/);
          if (titleMatch) {
            flushParagraph();
            flushList();
            const level = titleMatch[1].length;
            htmlParts.push(`<h${level}>${renderInlineMarkdown(titleMatch[2])}</h${level}>`);
            return;
          }

          const unorderedMatch = trimmed.match(/^[-*]\s+(.+)$/);
          if (unorderedMatch) {
            flushParagraph();
            if (listType && listType !== "ul") {
              flushList();
            }
            listType = "ul";
            listItems.push(unorderedMatch[1]);
            return;
          }

          const orderedMatch = trimmed.match(/^\d+\.\s+(.+)$/);
          if (orderedMatch) {
            flushParagraph();
            if (listType && listType !== "ol") {
              flushList();
            }
            listType = "ol";
            listItems.push(orderedMatch[1]);
            return;
          }

          flushList();
          paragraphBuffer.push(trimmed);
        });

        flushParagraph();
        flushList();

        return htmlParts.join("");
      }

      // 现在处理Markdown语法
      let html = "";
      const textParts = processedMd.split(/(__CODE_BLOCK_\d+__|__LATEX_BLOCK_\d+__)/);
      
      textParts.forEach(part => {
        // 如果是占位符，直接保留
        if (part.match(/^__(?:CODE_BLOCK|LATEX_BLOCK)_\d+__$/)) {
          html += part;
          return;
        }

        html += renderTextSegment(part);
      });

      // 替换回LaTeX公式
      html = html.replace(/__LATEX_BLOCK_(\d+)__/g, (match, index) => {
        const latex = latexBlocks[parseInt(index)];
        return renderLatex(latex.content, true);
      });
      
      html = html.replace(/__LATEX_INLINE_(\d+)__/g, (match, index) => {
        const latex = latexBlocks[parseInt(index)];
        return renderLatex(latex.content, false);
      });
      
      // 替换回代码块
      html = html.replace(/__CODE_BLOCK_(\d+)__/g, (match, index) => {
        const codeBlock = codeBlocks[parseInt(index)];
        return renderCodeBlock(codeBlock.code, codeBlock.language);
      });

      return html;
    }

    // 通过消息传递获取标准化的 API URL，避免重复代码
    async function normalizeApiUrl(raw) {
      try {
        const response = await chrome.runtime.sendMessage({
          type: "NORMALIZE_API_URL",
          url: raw
        });
        return response?.url || raw;
      } catch (e) {
        console.error("获取标准化 API URL 失败:", e);
        return raw;
      }
    }

    async function loadProfiles() {
      try {
        const response = await chrome.runtime.sendMessage({ type: "GET_FULL_CONFIG" });
        if (!response?.ok) {
          throw new Error(response?.error || t("overlay_load_config_fail", currentLang));
        }
        
        const { profiles, activeLlmId: configActiveId } = response.config;
        
        llmProfiles = profiles;
        activeLlmId = configActiveId;

        // 渲染下拉框
        profileSelect.innerHTML = "";
        llmProfiles.forEach((p) => {
          const opt = document.createElement("option");
          opt.value = p.id;
          opt.textContent = p.name || "(未命名配置)";
          profileSelect.appendChild(opt);
        });
        profileSelect.value = activeLlmId;
      } catch (e) {
        console.error("加载配置失败:", e);
        setStatus(t("overlay_load_config_fail", currentLang) + (e?.message || String(e)), true);
      }
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
        setStatus(t("overlay_switched_profile", currentLang) + (selectedProfile.name || '未命名配置'));
        setTimeout(() => setStatus(""), 2000);
      } else {
        console.error("选择的配置不存在:", selectedId);
        setStatus(t("overlay_profile_not_found", currentLang), true);
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

        document.addEventListener("mousemove", onDragMove, { passive: false });
        document.addEventListener("mouseup", onDragEnd, { passive: false });
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
        document.removeEventListener("mousemove", onDragMove, { passive: false });
        document.removeEventListener("mouseup", onDragEnd, { passive: false });
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
        document.removeEventListener("mousemove", onFloatMove, { passive: false });
        document.removeEventListener("mouseup", onFloatUp, { passive: false });
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

        document.addEventListener("mousemove", onFloatMove, { passive: false });
        document.addEventListener("mouseup", onFloatUp, { passive: false });
      });
    })();

    document.documentElement.appendChild(floatBtn);
    document.documentElement.appendChild(panel);

    // 面板缩放逻辑
    (function initResize() {
      const minWidth = 420;
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
        document.removeEventListener("mousemove", onMouseMove, { passive: false });
        document.removeEventListener("mouseup", onMouseUp, { passive: false });
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

        document.addEventListener("mousemove", onMouseMove, { passive: false });
        document.addEventListener("mouseup", onMouseUp, { passive: false });
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
        rerenderPendingMath(bubble);
        
        // 检查是否需要折叠（只对用户消息进行折叠）
        const textLength = (msg.content || "").length;
        const needsCollapse = msg.role === "user" && textLength > COLLAPSE_THRESHOLD;
        
        if (needsCollapse) {
          bubble.classList.add("llm-reader-chat-bubble-collapsible", "llm-reader-chat-bubble-collapsed");
          bubble.setAttribute("data-collapsed", "true");
          
          const expandBtn = document.createElement("button");
          expandBtn.className = "llm-reader-chat-expand-btn";
          expandBtn.textContent = t("overlay_expand", currentLang);
          expandBtn.setAttribute("aria-label", t("overlay_expand", currentLang));
          
          expandBtn.addEventListener("click", () => {
            const isCollapsed = bubble.getAttribute("data-collapsed") === "true";
            if (isCollapsed) {
              bubble.classList.remove("llm-reader-chat-bubble-collapsed");
              bubble.setAttribute("data-collapsed", "false");
              expandBtn.textContent = t("overlay_collapse", currentLang);
            } else {
              bubble.classList.add("llm-reader-chat-bubble-collapsed");
              bubble.setAttribute("data-collapsed", "true");
              expandBtn.textContent = t("overlay_expand", currentLang);
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
          requestAnimationFrame(() => {
            scrollTarget.scrollIntoView({ behavior: "smooth", block: "center" });
            scrollTarget.removeAttribute("data-scroll-target");
          });
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
        const restoreScrollFrame = requestAnimationFrame(() => {
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
      rerenderPendingMath(bubble);

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
      setStatus(t("overlay_reading_page", currentLang));
      try {
        const res = await chrome.runtime.sendMessage({ type: "GET_PAGE_DATA" });
        if (!res?.ok) {
          throw new Error(res?.error || t("overlay_read_fail", currentLang));
        }
        pageDataCache = res.pageData;
        setStatus("");
        return pageDataCache;
      } catch (e) {
        setStatus(t("overlay_read_fail", currentLang) + (e?.message || String(e)), true);
        throw e;
      }
    }

    function getActiveProfile() {
      const found =
        llmProfiles.find((p) => p.id === activeLlmId) || llmProfiles[0] || null;
      if (!found) {
        throw new Error(t("overlay_no_config", currentLang));
      }
      return found;
    }

    async function streamChat(promptMessages, onDelta, onDone) {
      if (!llmProfiles.length) {
        await loadProfiles();
      }
      const { apiUrl, apiKey, model } = getActiveProfile();
      const endpoint = await normalizeApiUrl(apiUrl);
      if (!apiUrl || !apiKey || !model) {
        throw new Error(t("overlay_no_api_config", currentLang));
      }

      const body = {
        model,
        messages: promptMessages,
        stream: true,
      };

      // 智谱模型特殊处理：关闭自动思考
      if (endpoint.includes("bigmodel.cn") || model.toLowerCase().startsWith("glm")) {
        body.thinking = {
          type: "disabled"
        };
      }

      // 创建 AbortController 用于取消请求
      currentAbortController = new AbortController();
      
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(body),
        signal: currentAbortController.signal, // 添加 signal
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
        currentAbortController = null;
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let buffer = "";
      let fullText = "";

      try {
        while (true) {
          // 检查是否被暂停
          if (isPaused) {
            console.log("流式响应被暂停");
            reader.cancel(); // 取消读取
            break;
          }
          
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
      } catch (error) {
        // 处理 AbortError（取消错误）
        if (error.name === 'AbortError') {
          console.log("请求被取消");
          onDone(fullText || "[响应已暂停]");
        } else {
          throw error;
        }
      } finally {
        currentAbortController = null;
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
        e.target === closeBtn ||
        e.target.closest(".llm-reader-input-row") ||
        e.target.closest(".llm-reader-panel-actions") ||
        e.target.closest(".llm-reader-font-size-controls") ||
        e.target.closest(".llm-reader-navigation-controls") ||
        e.target.closest(".llm-reader-chat-expand-btn") ||
        e.target.closest(".llm-reader-resize-handle") ||
        e.target.closest(".llm-reader-resize-corner") ||
        e.target.closest(".llm-reader-resize-edge")
      ) {
        return;
      }
      closePanel();
    });

    settingsBtn.addEventListener("click", () => {
      openSettingsPanel();
    });

    historyBtn.addEventListener("click", () => {
      openHistoryPanel();
    });

    analyzeBtn.addEventListener("click", async () => {
      if (isStreaming) return;
      
      // 设置流式状态（显示暂停按钮）
      setStreamingState(true);
      
      chatList.innerHTML = "";
      messages = [];
      currentQaIndex = -1; // 重置导航索引

      try {
        const pageData = await ensurePageData();
        const titleText = pageData.title || t("prompt_no_title", currentLang);
        const urlText = pageData.url || t("prompt_no_link", currentLang);
        const bodyText = pageData.text || t("prompt_no_content", currentLang);

        const systemMsg = {
          role: "system",
          content: t("prompt_system", currentLang),
        };
        const userMsg = {
          role: "user",
          content: `${t("prompt_user_intro", currentLang)}

${t("prompt_page_title", currentLang)}${titleText}
${t("prompt_page_link", currentLang)}${urlText}

${t("prompt_content_start", currentLang)}
${bodyText}`,
        };

        messages = [systemMsg, userMsg];
        appendChatItem("user", t("overlay_ask_analyze", currentLang));
        const assistantBubble = appendChatItem("assistant", "");
        setStatus(t("overlay_analyzing", currentLang));

        await streamChat(
          messages,
          (delta, full) => {
            assistantBubble.innerHTML = markdownToHtml(full);
            smartScrollToBottom();
          },
          async (full) => {
            messages.push({ role: "assistant", content: full });
            setStatus(t("overlay_analyze_done", currentLang));
            // 更新问答对和导航，但保持用户当前位置不变
            qaPairs = extractQaPairs(messages);
            if (qaPairs.length > 0) {
              currentQaIndex = qaPairs.length - 1;
            }
            updateNavigation(true); // preserveScroll = true，保持滚动位置
            
            // 保存对话历史
            await saveChatHistory();
          }
        );
      } catch (e) {
        setStatus(t("overlay_call_fail", currentLang) + (e?.message || String(e)), true);
      } finally {
        // 使用统一的流式状态设置函数（隐藏暂停按钮）
        setStreamingState(false);
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

      // 设置流式状态
      setStreamingState(true);
      
      // 添加用户消息到 messages
      const userMsg = { role: "user", content: text };
      messages = messages.concat(userMsg);
      
      // 显示用户消息
      appendChatItem("user", text);
      input.value = "";
      const assistantBubble = appendChatItem("assistant", "");
      setStatus(t("overlay_thinking", currentLang));

      const promptMessages = messages;

      try {
        await streamChat(
          promptMessages,
          (delta, full) => {
            assistantBubble.innerHTML = markdownToHtml(full);
            smartScrollToBottom();
          },
          async (full) => {
            // 添加助手回复并更新导航
            await addAssistantResponseAndUpdateNavigation(full);
          }
        );
      } catch (e) {
        setStatus(t("overlay_call_fail", currentLang) + (e?.message || String(e)), true);
      } finally {
        setStreamingState(false);
      }
    }

    // 统一的流式状态设置函数
    function setStreamingState(streaming) {
      isStreaming = streaming;
      sendBtn.disabled = streaming;
      analyzeBtn.disabled = streaming;
      input.disabled = streaming;
      
      // 显示/隐藏暂停按钮
      if (streaming) {
        pauseBtn.style.display = "inline-flex";
        isPaused = false; // 重置暂停状态
      } else {
        pauseBtn.style.display = "none";
      }
    }

    // 暂停功能
    function pauseStreaming() {
      if (currentAbortController && isStreaming) {
        isPaused = true;
        currentAbortController.abort(); // 取消请求
        setStatus(t("overlay_paused", currentLang));
        setTimeout(() => setStatus(""), 2000);
      }
    }

    // 统一的助手回复处理函数
    async function addAssistantResponseAndUpdateNavigation(full) {
      messages = messages.concat({ role: "assistant", content: full });
      setStatus(t("overlay_replied", currentLang));
      // 更新问答对和导航，但保持用户当前位置不变
      qaPairs = extractQaPairs(messages);
      if (qaPairs.length > 0) {
        currentQaIndex = qaPairs.length - 1;
      }
      updateNavigation(true); // preserveScroll = true，保持滚动位置
      
      // 保存对话历史
      await saveChatHistory();
    }

    sendBtn.addEventListener("click", () => {
      sendUserMessage();
    });

    pauseBtn.addEventListener("click", () => {
      pauseStreaming();
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

    // 更新所有 UI 文本（用于语言切换后刷新）
    function updateUITexts() {
      analyzeBtn.textContent = t("overlay_analyze_btn", currentLang);
      settingsBtn.title = t("overlay_settings_btn", currentLang);
      sendBtn.textContent = t("overlay_send_btn", currentLang);
      pauseBtn.textContent = t("overlay_pause_btn", currentLang);
      input.placeholder = t("overlay_input_placeholder", currentLang);
      decreaseFontSizeBtn.title = t("overlay_decrease_font", currentLang);
      increaseFontSizeBtn.title = t("overlay_increase_font", currentLang);
      prevBtn.title = t("overlay_prev_qa", currentLang);
      nextBtn.title = t("overlay_next_qa", currentLang);
    }

    // ========== 设置面板相关 ==========
    let settingsOverlay = null;
    let settingsProfiles = [];
    let settingsActiveId = null;

    function createSettingsPanel() {
      // 创建遮罩层
      const overlay = document.createElement("div");
      overlay.className = "llm-reader-settings-overlay";

      // 创建设置面板
      const panel = document.createElement("div");
      panel.className = "llm-reader-settings-panel";

      // 头部
      const header = document.createElement("div");
      header.className = "llm-reader-settings-header";

      const titleEl = document.createElement("div");
      titleEl.className = "llm-reader-settings-title";
      titleEl.textContent = t("settings_title", currentLang);

      const closeBtn = document.createElement("button");
      closeBtn.className = "llm-reader-settings-close";
      closeBtn.textContent = "×";
      closeBtn.addEventListener("click", closeSettingsPanel);

      header.appendChild(titleEl);
      header.appendChild(closeBtn);

      // 主体
      const body = document.createElement("div");
      body.className = "llm-reader-settings-body";

      // 语言设置区域
      const langSection = document.createElement("div");
      langSection.className = "llm-reader-settings-section";

      const langTitle = document.createElement("div");
      langTitle.className = "llm-reader-settings-section-title";
      langTitle.textContent = t("settings_language", currentLang);

      const langField = document.createElement("div");
      langField.className = "llm-reader-settings-field";

      const langSelect = document.createElement("select");
      langSelect.className = "llm-reader-settings-select";
      langSelect.id = "settings-language-select";
      langSelect.innerHTML = `
        <option value="zh-CN">简体中文</option>
        <option value="en-US">English</option>
        <option value="ja-JP">日本語</option>
        <option value="de-DE">Deutsch</option>
        <option value="fr-FR">Français</option>
        <option value="ru-RU">Русский</option>
        <option value="es-ES">Español</option>
        <option value="ko-KR">한국어</option>
      `;
      langSelect.value = currentLang;

      langField.appendChild(langSelect);
      langSection.appendChild(langTitle);
      langSection.appendChild(langField);

      // LLM 配置区域
      const llmSection = document.createElement("div");
      llmSection.className = "llm-reader-settings-section";

      const llmTitle = document.createElement("div");
      llmTitle.className = "llm-reader-settings-section-title";
      llmTitle.textContent = t("settings_llm_config", currentLang);

      // 配置选择行
      const profileRow = document.createElement("div");
      profileRow.className = "llm-reader-settings-profile-row";

      const profileSelect = document.createElement("select");
      profileSelect.className = "llm-reader-settings-profile-select";
      profileSelect.id = "settings-profile-select";

      const addBtn = document.createElement("button");
      addBtn.className = "llm-reader-settings-btn-small";
      addBtn.textContent = t("settings_add_profile", currentLang);
      addBtn.id = "settings-add-btn";

      const deleteBtn = document.createElement("button");
      deleteBtn.className = "llm-reader-settings-btn-small danger";
      deleteBtn.textContent = t("settings_delete_profile", currentLang);
      deleteBtn.id = "settings-delete-btn";

      profileRow.appendChild(profileSelect);
      profileRow.appendChild(addBtn);
      profileRow.appendChild(deleteBtn);

      // 配置名称
      const nameField = document.createElement("div");
      nameField.className = "llm-reader-settings-field";
      const nameLabel = document.createElement("label");
      nameLabel.className = "llm-reader-settings-label";
      nameLabel.textContent = t("settings_profile_name", currentLang);
      const nameInput = document.createElement("input");
      nameInput.className = "llm-reader-settings-input";
      nameInput.type = "text";
      nameInput.id = "settings-profile-name";
      nameInput.placeholder = t("settings_placeholder_name", currentLang);
      nameField.appendChild(nameLabel);
      nameField.appendChild(nameInput);

      // API URL
      const urlField = document.createElement("div");
      urlField.className = "llm-reader-settings-field";
      const urlLabel = document.createElement("label");
      urlLabel.className = "llm-reader-settings-label";
      urlLabel.textContent = t("settings_api_url", currentLang);
      const urlInput = document.createElement("input");
      urlInput.className = "llm-reader-settings-input";
      urlInput.type = "text";
      urlInput.id = "settings-api-url";
      urlInput.placeholder = t("settings_placeholder_url", currentLang);
      urlField.appendChild(urlLabel);
      urlField.appendChild(urlInput);

      // API Key
      const keyField = document.createElement("div");
      keyField.className = "llm-reader-settings-field";
      const keyLabel = document.createElement("label");
      keyLabel.className = "llm-reader-settings-label";
      keyLabel.textContent = t("settings_api_key", currentLang);
      const keyInput = document.createElement("input");
      keyInput.className = "llm-reader-settings-input";
      keyInput.type = "password";
      keyInput.id = "settings-api-key";
      keyInput.placeholder = t("settings_placeholder_key", currentLang);
      keyField.appendChild(keyLabel);
      keyField.appendChild(keyInput);

      // Model
      const modelField = document.createElement("div");
      modelField.className = "llm-reader-settings-field";
      const modelLabel = document.createElement("label");
      modelLabel.className = "llm-reader-settings-label";
      modelLabel.textContent = t("settings_model", currentLang);
      const modelInput = document.createElement("input");
      modelInput.className = "llm-reader-settings-input";
      modelInput.type = "text";
      modelInput.id = "settings-model";
      modelInput.placeholder = t("settings_placeholder_model", currentLang);
      modelField.appendChild(modelLabel);
      modelField.appendChild(modelInput);

      llmSection.appendChild(llmTitle);
      llmSection.appendChild(profileRow);
      llmSection.appendChild(nameField);
      llmSection.appendChild(urlField);
      llmSection.appendChild(keyField);
      llmSection.appendChild(modelField);

      // 状态提示
      const statusEl = document.createElement("div");
      statusEl.className = "llm-reader-settings-status";
      statusEl.id = "settings-status";

      body.appendChild(langSection);
      body.appendChild(llmSection);
      body.appendChild(statusEl);

      // 底部按钮
      const footer = document.createElement("div");
      footer.className = "llm-reader-settings-footer";

      const cancelBtn = document.createElement("button");
      cancelBtn.className = "llm-reader-settings-btn-secondary";
      cancelBtn.textContent = t("settings_close", currentLang);
      cancelBtn.addEventListener("click", closeSettingsPanel);

      const saveBtn = document.createElement("button");
      saveBtn.className = "llm-reader-settings-btn-primary";
      saveBtn.textContent = t("settings_save", currentLang);
      saveBtn.id = "settings-save-btn";

      footer.appendChild(cancelBtn);
      footer.appendChild(saveBtn);

      panel.appendChild(header);
      panel.appendChild(body);
      panel.appendChild(footer);
      overlay.appendChild(panel);

      // 点击遮罩层关闭
      overlay.addEventListener("click", (e) => {
        if (e.target === overlay) {
          closeSettingsPanel();
        }
      });

      // 绑定事件
      bindSettingsEvents(overlay);

      return overlay;
    }

    function bindSettingsEvents(overlay) {
      const settingsProfileSelect = overlay.querySelector("#settings-profile-select");
      const settingsNameInput = overlay.querySelector("#settings-profile-name");
      const settingsUrlInput = overlay.querySelector("#settings-api-url");
      const settingsKeyInput = overlay.querySelector("#settings-api-key");
      const settingsModelInput = overlay.querySelector("#settings-model");
      const settingsAddBtn = overlay.querySelector("#settings-add-btn");
      const settingsDeleteBtn = overlay.querySelector("#settings-delete-btn");
      const settingsSaveBtn = overlay.querySelector("#settings-save-btn");
      const settingsStatusEl = overlay.querySelector("#settings-status");
      const settingsLangSelect = overlay.querySelector("#settings-language-select");

      function setSettingsStatus(text, type = "") {
        settingsStatusEl.textContent = text || "";
        settingsStatusEl.className = "llm-reader-settings-status" + (type ? " " + type : "");
      }

      function renderSettingsProfileSelect() {
        settingsProfileSelect.innerHTML = "";
        settingsProfiles.forEach((p) => {
          const opt = document.createElement("option");
          opt.value = p.id;
          opt.textContent = p.name || "(未命名配置)";
          settingsProfileSelect.appendChild(opt);
        });
        settingsProfileSelect.value = settingsActiveId;
      }

      function loadProfileToForm() {
        const profile = settingsProfiles.find((p) => p.id === settingsActiveId);
        if (profile) {
          settingsNameInput.value = profile.name || "";
          settingsUrlInput.value = profile.apiUrl || "";
          settingsKeyInput.value = profile.apiKey || "";
          settingsModelInput.value = profile.model || "";
        } else {
          settingsNameInput.value = "";
          settingsUrlInput.value = "";
          settingsKeyInput.value = "";
          settingsModelInput.value = "";
        }
      }

      function genId() {
        return "p_" + Date.now().toString(36) + "_" + Math.random().toString(16).slice(2, 8);
      }

      // 配置选择变化
      settingsProfileSelect.addEventListener("change", () => {
        settingsActiveId = settingsProfileSelect.value;
        loadProfileToForm();
      });

      // 新增配置
      settingsAddBtn.addEventListener("click", () => {
        const newProfile = {
          id: genId(),
          name: t("settings_add_profile", currentLang) + " " + (settingsProfiles.length + 1),
          apiUrl: "",
          apiKey: "",
          model: "",
        };
        settingsProfiles.push(newProfile);
        settingsActiveId = newProfile.id;
        renderSettingsProfileSelect();
        loadProfileToForm();
        setSettingsStatus(t("settings_added", currentLang), "success");
        setTimeout(() => setSettingsStatus(""), 2000);
      });

      // 删除配置
      settingsDeleteBtn.addEventListener("click", () => {
        if (settingsProfiles.length <= 1) {
          setSettingsStatus(t("settings_at_least_one", currentLang), "error");
          setTimeout(() => setSettingsStatus(""), 2000);
          return;
        }
        settingsProfiles = settingsProfiles.filter((p) => p.id !== settingsActiveId);
        settingsActiveId = settingsProfiles[0]?.id || null;
        renderSettingsProfileSelect();
        loadProfileToForm();
        setSettingsStatus(t("settings_deleted", currentLang), "success");
        setTimeout(() => setSettingsStatus(""), 2000);
      });

      // 保存配置
      settingsSaveBtn.addEventListener("click", async () => {
        const name = settingsNameInput.value.trim();
        const apiUrl = settingsUrlInput.value.trim();
        const apiKey = settingsKeyInput.value.trim();
        const model = settingsModelInput.value.trim();

        if (!apiUrl || !apiKey || !model) {
          setSettingsStatus(t("settings_fill_all", currentLang), "error");
          setTimeout(() => setSettingsStatus(""), 2000);
          return;
        }

        // 更新当前配置
        const idx = settingsProfiles.findIndex((p) => p.id === settingsActiveId);
        if (idx !== -1) {
          settingsProfiles[idx] = {
            ...settingsProfiles[idx],
            name: name || "未命名配置",
            apiUrl,
            apiKey,
            model,
          };
        }

        try {
          await chrome.storage.sync.set({
            llmProfiles: settingsProfiles,
            activeLlmId: settingsActiveId,
          });

          // 更新主面板的配置
          llmProfiles = [...settingsProfiles];
          activeLlmId = settingsActiveId;
          
          // 更新主面板的下拉框
          profileSelect.innerHTML = "";
          llmProfiles.forEach((p) => {
            const opt = document.createElement("option");
            opt.value = p.id;
            opt.textContent = p.name || "(未命名配置)";
            profileSelect.appendChild(opt);
          });
          profileSelect.value = activeLlmId;

          renderSettingsProfileSelect();
          setSettingsStatus(t("settings_saved", currentLang), "success");
          setTimeout(() => setSettingsStatus(""), 2000);
        } catch (err) {
          console.error("保存配置失败:", err);
          setSettingsStatus(t("settings_save_fail", currentLang) + ": " + err.message, "error");
        }
      });

      // 语言切换
      settingsLangSelect.addEventListener("change", async () => {
        const newLang = settingsLangSelect.value;
        currentLang = newLang;
        await chrome.storage.sync.set({ language: newLang });
        
        // 更新设置面板的文本
        updateSettingsPanelTexts(overlay);
        
        // 更新主面板的文本
        updateUITexts();
      });
    }

    function updateSettingsPanelTexts(overlay) {
      const titleEl = overlay.querySelector(".llm-reader-settings-title");
      const sectionTitles = overlay.querySelectorAll(".llm-reader-settings-section-title");
      const labels = overlay.querySelectorAll(".llm-reader-settings-label");
      const addBtn = overlay.querySelector("#settings-add-btn");
      const deleteBtn = overlay.querySelector("#settings-delete-btn");
      const saveBtn = overlay.querySelector("#settings-save-btn");
      const cancelBtn = overlay.querySelector(".llm-reader-settings-btn-secondary");
      const inputs = overlay.querySelectorAll(".llm-reader-settings-input");

      if (titleEl) titleEl.textContent = t("settings_title", currentLang);
      if (sectionTitles[0]) sectionTitles[0].textContent = t("settings_language", currentLang);
      if (sectionTitles[1]) sectionTitles[1].textContent = t("settings_llm_config", currentLang);
      if (labels[0]) labels[0].textContent = t("settings_profile_name", currentLang);
      if (labels[1]) labels[1].textContent = t("settings_api_url", currentLang);
      if (labels[2]) labels[2].textContent = t("settings_api_key", currentLang);
      if (labels[3]) labels[3].textContent = t("settings_model", currentLang);
      if (addBtn) addBtn.textContent = t("settings_add_profile", currentLang);
      if (deleteBtn) deleteBtn.textContent = t("settings_delete_profile", currentLang);
      if (saveBtn) saveBtn.textContent = t("settings_save", currentLang);
      if (cancelBtn) cancelBtn.textContent = t("settings_close", currentLang);
      
      if (inputs[0]) inputs[0].placeholder = t("settings_placeholder_name", currentLang);
      if (inputs[1]) inputs[1].placeholder = t("settings_placeholder_url", currentLang);
      if (inputs[2]) inputs[2].placeholder = t("settings_placeholder_key", currentLang);
      if (inputs[3]) inputs[3].placeholder = t("settings_placeholder_model", currentLang);
    }

    async function openSettingsPanel() {
      // 加载配置
      try {
        const response = await chrome.runtime.sendMessage({ type: "GET_FULL_CONFIG" });
        if (response?.ok) {
          settingsProfiles = response.config.profiles || [];
          settingsActiveId = response.config.activeLlmId || settingsProfiles[0]?.id;
        }
      } catch (e) {
        console.error("加载配置失败:", e);
      }

      // 创建或显示设置面板
      if (!settingsOverlay) {
        settingsOverlay = createSettingsPanel();
        document.documentElement.appendChild(settingsOverlay);
      }

      // 更新语言选择
      const langSelect = settingsOverlay.querySelector("#settings-language-select");
      if (langSelect) langSelect.value = currentLang;

      // 更新配置列表
      const profileSelect = settingsOverlay.querySelector("#settings-profile-select");
      profileSelect.innerHTML = "";
      settingsProfiles.forEach((p) => {
        const opt = document.createElement("option");
        opt.value = p.id;
        opt.textContent = p.name || "(未命名配置)";
        profileSelect.appendChild(opt);
      });
      profileSelect.value = settingsActiveId;

      // 加载当前配置到表单
      const profile = settingsProfiles.find((p) => p.id === settingsActiveId);
      const nameInput = settingsOverlay.querySelector("#settings-profile-name");
      const urlInput = settingsOverlay.querySelector("#settings-api-url");
      const keyInput = settingsOverlay.querySelector("#settings-api-key");
      const modelInput = settingsOverlay.querySelector("#settings-model");

      if (profile) {
        nameInput.value = profile.name || "";
        urlInput.value = profile.apiUrl || "";
        keyInput.value = profile.apiKey || "";
        modelInput.value = profile.model || "";
      }

      // 更新面板文本
      updateSettingsPanelTexts(settingsOverlay);

      // 显示面板
      requestAnimationFrame(() => {
        settingsOverlay.classList.add("visible");
      });
    }

    function closeSettingsPanel() {
      if (settingsOverlay) {
        settingsOverlay.classList.remove("visible");
      }
    }

    // ========== 历史记录面板相关 ==========
    let historyOverlay = null;
    let chatHistory = [];

    // 保存对话历史到存储
    async function saveChatHistory() {
      try {
        // 只保存有实际内容的对话（至少包含一个用户消息）
        const validHistory = messages.filter(msg => msg.role !== 'system' && msg.content.trim());
        if (validHistory.length === 0) return;
        const pageData = await ensurePageData();
        const response = await chrome.runtime.sendMessage({
          type: "SAVE_CONVERSATION_HISTORY",
          pageData: {
            title: pageData?.title || document.title || "未知页面",
            url: pageData?.url || window.location.href,
          },
          messages,
          profileId: activeLlmId,
        });

        if (!response?.ok) {
          throw new Error(response?.error || "保存失败");
        }

        // 显示保存成功提示
        setStatus(t("history_saved", currentLang), false);
        setTimeout(() => setStatus(""), 2000);
      } catch (e) {
        console.error('保存对话历史失败:', e);
        setStatus(t("history_save_failed", currentLang), true);
      }
    }

    // 生成历史记录预览文本
    function generateHistoryPreview(messages) {
      const userMessages = messages.filter(msg => msg.role === 'user');
      if (userMessages.length === 0) return '';
      
      const firstUserMessage = userMessages[0].content;
      const preview = firstUserMessage.length > 100
        ? firstUserMessage.substring(0, 100) + '...'
        : firstUserMessage;
      
      return preview;
    }

    // 加载对话历史
    async function loadChatHistory() {
      try {
        const response = await chrome.runtime.sendMessage({
          type: "GET_CONVERSATION_HISTORY",
        });
        if (!response?.ok) {
          throw new Error(response?.error || "加载失败");
        }
        chatHistory = response.history || [];
        return chatHistory;
      } catch (e) {
        console.error('加载对话历史失败:', e);
        return [];
      }
    }

    // 创建历史记录面板
    function createHistoryPanel() {
      // 创建遮罩层
      const overlay = document.createElement("div");
      overlay.className = "llm-reader-history-overlay";

      // 创建历史记录面板
      const panel = document.createElement("div");
      panel.className = "llm-reader-history-panel";

      // 头部
      const header = document.createElement("div");
      header.className = "llm-reader-history-header";

      const titleEl = document.createElement("div");
      titleEl.className = "llm-reader-history-title";
      titleEl.textContent = t("history_title", currentLang);

      const closeBtn = document.createElement("button");
      closeBtn.className = "llm-reader-history-close";
      closeBtn.textContent = "×";
      closeBtn.addEventListener("click", closeHistoryPanel);

      header.appendChild(titleEl);
      header.appendChild(closeBtn);

      // 搜索区域
      const searchSection = document.createElement("div");
      searchSection.className = "llm-reader-history-search";

      const searchInput = document.createElement("input");
      searchInput.className = "llm-reader-history-search-input";
      searchInput.type = "text";
      searchInput.placeholder = t("history_search_placeholder", currentLang);
      searchInput.id = "history-search-input";

      searchSection.appendChild(searchInput);

      // 历史记录列表
      const listSection = document.createElement("div");
      listSection.className = "llm-reader-history-list";
      listSection.id = "history-list";

      // 底部
      const footer = document.createElement("div");
      footer.className = "llm-reader-history-footer";

      const countEl = document.createElement("div");
      countEl.className = "llm-reader-history-count";
      countEl.id = "history-count";
      countEl.textContent = t("history_count", currentLang).replace("{count}", "0");

      const clearBtn = document.createElement("button");
      clearBtn.className = "llm-reader-history-clear-btn";
      clearBtn.textContent = t("history_clear_all", currentLang);
      clearBtn.id = "history-clear-btn";

      footer.appendChild(countEl);
      footer.appendChild(clearBtn);

      panel.appendChild(header);
      panel.appendChild(searchSection);
      panel.appendChild(listSection);
      panel.appendChild(footer);
      overlay.appendChild(panel);

      // 点击遮罩层关闭
      overlay.addEventListener("click", (e) => {
        if (e.target === overlay) {
          closeHistoryPanel();
        }
      });

      // 绑定事件
      bindHistoryEvents(overlay);

      return overlay;
    }

    // 绑定历史记录面板事件
    function bindHistoryEvents(overlay) {
      const searchInput = overlay.querySelector("#history-search-input");
      const listEl = overlay.querySelector("#history-list");
      const countEl = overlay.querySelector("#history-count");
      const clearBtn = overlay.querySelector("#history-clear-btn");

      function getHistoryPreviewText(item) {
        return generateHistoryPreview((item.messages || []).filter(msg => msg.role !== "system")) || "";
      }

      function filterHistoryItemsLocally(historyItems, query) {
        if (!query) return historyItems;

        return historyItems.filter(item =>
          (item.title && item.title.toLowerCase().includes(query)) ||
          (getHistoryPreviewText(item) && getHistoryPreviewText(item).toLowerCase().includes(query)) ||
          (item.url && item.url.toLowerCase().includes(query))
        );
      }

      function getHistoryUrlLabel(url) {
        if (!url) return "";
        try {
          return new URL(url).hostname;
        } catch {
          return url;
        }
      }

      // 渲染历史记录列表
      function renderHistoryList(historyItems) {
        listEl.innerHTML = "";
        
        if (historyItems.length === 0) {
          const emptyEl = document.createElement("div");
          emptyEl.className = "llm-reader-history-empty";
          emptyEl.textContent = t("history_empty", currentLang);
          listEl.appendChild(emptyEl);
          countEl.textContent = t("history_count", currentLang).replace("{count}", "0");
          return;
        }

        historyItems.forEach(item => {
          const itemEl = createHistoryItem(item);
          listEl.appendChild(itemEl);
        });

        countEl.textContent = t("history_count", currentLang).replace("{count}", historyItems.length);
      }

      // 创建历史记录项
      function createHistoryItem(item) {
        const itemEl = document.createElement("div");
        itemEl.className = "llm-reader-history-item";

        // 头部
        const headerEl = document.createElement("div");
        headerEl.className = "llm-reader-history-item-header";

        const titleEl = document.createElement("div");
        titleEl.className = "llm-reader-history-item-title";
        titleEl.textContent = item.title || '未知页面';

        const dateEl = document.createElement("div");
        dateEl.className = "llm-reader-history-item-date";
        const itemTimestamp = item.updated_at || item.created_at || Date.now();
        dateEl.textContent = formatDate(itemTimestamp);
        dateEl.title = new Date(itemTimestamp).toISOString();

        headerEl.appendChild(titleEl);
        headerEl.appendChild(dateEl);

        // 元信息
        const metaEl = document.createElement("div");
        metaEl.className = "llm-reader-history-item-meta";

        const urlEl = document.createElement("a");
        urlEl.className = "llm-reader-history-item-url";
        urlEl.href = item.url;
        urlEl.target = "_blank";
        urlEl.textContent = getHistoryUrlLabel(item.url);

        const messageCountEl = document.createElement("span");
        messageCountEl.textContent = `${(item.messages || []).filter(m => m.role !== 'system').length} ${t("history_messages", currentLang)}`;

        metaEl.appendChild(urlEl);
        metaEl.appendChild(messageCountEl);

        // 预览
        const previewEl = document.createElement("div");
        previewEl.className = "llm-reader-history-item-preview";
        previewEl.textContent = getHistoryPreviewText(item);

        // 操作按钮
        const actionsEl = document.createElement("div");
        actionsEl.className = "llm-reader-history-item-actions";

        const loadBtn = document.createElement("button");
        loadBtn.className = "llm-reader-history-btn-small";
        loadBtn.textContent = t("history_load", currentLang);
        loadBtn.addEventListener("click", () => loadHistoryItem(item));

        const deleteBtn = document.createElement("button");
        deleteBtn.className = "llm-reader-history-btn-small danger";
        deleteBtn.textContent = t("history_delete", currentLang);
        deleteBtn.addEventListener("click", () => deleteHistoryItem(item.id));

        actionsEl.appendChild(loadBtn);
        actionsEl.appendChild(deleteBtn);

        itemEl.appendChild(headerEl);
        itemEl.appendChild(metaEl);
        itemEl.appendChild(previewEl);
        itemEl.appendChild(actionsEl);

        return itemEl;
      }

      // 格式化日期
      function formatDate(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now - date;
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        // 获取年月日信息
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const time = date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
        
        // 构建完整的年月日时间字符串
        const fullDateTime = `${year}-${month}-${day} ${time}`;

        if (diffDays === 0) {
          // 今天：显示时间 + 完整日期
          return `${time} (${year}-${month}-${day})`;
        } else if (diffDays === 1) {
          // 昨天：显示昨天 + 完整日期
          return `${t("history_yesterday", currentLang)} (${year}-${month}-${day})`;
        } else if (diffDays < 7) {
          // 一周内：显示天数前 + 完整日期
          return `${diffDays} ${t("history_days_ago", currentLang)} (${year}-${month}-${day})`;
        } else {
          // 更久之前：显示完整月日 + 年份
          return `${year}-${month}-${day} ${time}`;
        }
      }

      // 搜索功能
      searchInput.addEventListener("input", async () => {
        const query = searchInput.value.toLowerCase().trim();
        let filteredHistory = chatHistory;

        if (query) {
          try {
            const response = await chrome.runtime.sendMessage({
              type: "SEARCH_CONVERSATION_HISTORY",
              query,
            });
            if (!response?.ok) {
              throw new Error(response?.error || "搜索失败");
            }
            filteredHistory = response.results || [];
          } catch (e) {
            console.error("搜索历史记录失败:", e);
            filteredHistory = filterHistoryItemsLocally(chatHistory, query);
          }
        }

        renderHistoryList(filteredHistory);
      });

      // 清空历史记录
      clearBtn.addEventListener("click", async () => {
        if (confirm(t("history_clear_confirm", currentLang))) {
          try {
            const response = await chrome.runtime.sendMessage({
              type: "CLEAR_ALL_HISTORY",
            });
            if (!response?.ok) {
              throw new Error(response?.error || "清空失败");
            }
            chatHistory = [];
            renderHistoryList([]);
          } catch (e) {
            console.error('清空历史记录失败:', e);
            alert(t("history_clear_error", currentLang));
          }
        }
      });

      // 加载历史记录项
      async function loadHistoryItem(item) {
        try {
          messages = [...item.messages];
          currentQaIndex = -1;
          updateNavigation();
          closeHistoryPanel();
          panel.style.display = "flex";
          setStatus(t("history_loaded", currentLang));
          setTimeout(() => setStatus(""), 2000);
        } catch (e) {
          console.error('加载历史记录失败:', e);
          setStatus(t("history_load_error", currentLang), true);
        }
      }

      // 删除历史记录项
      async function deleteHistoryItem(itemId) {
        try {
          const response = await chrome.runtime.sendMessage({
            type: "DELETE_CONVERSATION",
            conversationId: itemId,
          });
          if (!response?.ok) {
            throw new Error(response?.error || "删除失败");
          }
          chatHistory = chatHistory.filter(item => item.id !== itemId);
          
          // 重新渲染列表
          const query = searchInput.value.toLowerCase().trim();
          renderHistoryList(filterHistoryItemsLocally(chatHistory, query));
        } catch (e) {
          console.error('删除历史记录失败:', e);
          alert(t("history_delete_error", currentLang));
        }
      }

      // 初始渲染
      renderHistoryList(chatHistory);
    }

    // 打开历史记录面板
    async function openHistoryPanel() {
      // 加载历史记录
      await loadChatHistory();

      // 创建或显示历史记录面板
      if (!historyOverlay) {
        historyOverlay = createHistoryPanel();
        document.documentElement.appendChild(historyOverlay);
      }

      // 显示面板
      requestAnimationFrame(() => {
        historyOverlay.classList.add("visible");
      });
    }

    // 关闭历史记录面板
    function closeHistoryPanel() {
      if (historyOverlay) {
        historyOverlay.classList.remove("visible");
      }
    }

    // 监听语言变化
    chrome.storage.onChanged.addListener((changes, areaName) => {
      if (areaName === "sync" && changes.language) {
        currentLang = changes.language.newValue || "zh-CN";
        updateUITexts();
      }
    });

    // 初始化时加载配置和语言
    async function init() {
      await loadLanguage();
      updateUITexts();
      await loadProfiles();
      await loadFontSize();
      initDoubleKeyListener(); // 初始化双击快捷键
    }
    
    init();

    // 监听来自 background 的消息，触发分析
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message?.type === "TRIGGER_ANALYSIS") {
        // 确保面板可见
        if (panel.style.display === "none") {
          panel.style.display = "flex";
        }
        // 触发分析
        if (analyzeBtn && !isStreaming) {
          analyzeBtn.click();
        }
        sendResponse({ ok: true });
        return true;
      }
      // 其他消息类型可以继续处理
      return false;
    });
  }

  // 等文档可用后渲染
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", createOverlay, { once: true });
  } else {
    createOverlay();
  }
}
