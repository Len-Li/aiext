// overlay.js - 在网页上显示一个可展开的悬浮窗

// 防止重复注入
if (!window.__llm_reader_overlay_injected__) {
  window.__llm_reader_overlay_injected__ = true;

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

      .llm-reader-settings-btn {
        background: transparent;
        border: none;
        padding: 4px;
        font-size: 16px;
        line-height: 1;
        cursor: pointer;
        opacity: 0.7;
        transition: opacity 0.15s ease, transform 0.15s ease;
      }

      .llm-reader-settings-btn:hover {
        opacity: 1;
        transform: rotate(30deg);
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
        align-items: center;
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
    analyzeBtn.textContent = t("overlay_analyze_btn", currentLang);

    const historyBtn = document.createElement("button");
    historyBtn.className = "llm-reader-settings-btn";
    historyBtn.textContent = "📚";
    historyBtn.title = t("overlay_history_btn", currentLang);

    const settingsBtn = document.createElement("button");
    settingsBtn.className = "llm-reader-settings-btn";
    settingsBtn.textContent = "⚙️";
    settingsBtn.title = t("overlay_settings_btn", currentLang);

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
      isStreaming = true;
      analyzeBtn.disabled = true;
      sendBtn.disabled = true;
      input.disabled = true;
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

        const historyItem = {
          id: Date.now().toString(36) + '_' + Math.random().toString(16).slice(2, 8),
          timestamp: Date.now(),
          url: window.location.href,
          title: document.title || '未知页面',
          messages: messages,
          preview: generateHistoryPreview(validHistory)
        };

        // 获取现有历史记录（使用local存储，避免sync配额限制）
        const result = await chrome.storage.local.get(['chatHistory']);
        const existingHistory = result.chatHistory || [];
        
        // 添加新记录到开头
        existingHistory.unshift(historyItem);
        
        // 限制历史记录数量（最多保存100条）
        if (existingHistory.length > 100) {
          existingHistory.splice(100);
        }

        await chrome.storage.local.set({ chatHistory: existingHistory });
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
        const result = await chrome.storage.local.get(['chatHistory']);
        chatHistory = result.chatHistory || [];
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
        dateEl.textContent = formatDate(item.timestamp);

        headerEl.appendChild(titleEl);
        headerEl.appendChild(dateEl);

        // 元信息
        const metaEl = document.createElement("div");
        metaEl.className = "llm-reader-history-item-meta";

        const urlEl = document.createElement("a");
        urlEl.className = "llm-reader-history-item-url";
        urlEl.href = item.url;
        urlEl.target = "_blank";
        urlEl.textContent = new URL(item.url).hostname;

        const messageCountEl = document.createElement("span");
        messageCountEl.textContent = `${item.messages.filter(m => m.role !== 'system').length} ${t("history_messages", currentLang)}`;

        metaEl.appendChild(urlEl);
        metaEl.appendChild(messageCountEl);

        // 预览
        const previewEl = document.createElement("div");
        previewEl.className = "llm-reader-history-item-preview";
        previewEl.textContent = item.preview || '';

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

        if (diffDays === 0) {
          return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
        } else if (diffDays === 1) {
          return t("history_yesterday", currentLang);
        } else if (diffDays < 7) {
          return `${diffDays} ${t("history_days_ago", currentLang)}`;
        } else {
          return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
        }
      }

      // 搜索功能
      searchInput.addEventListener("input", () => {
        const query = searchInput.value.toLowerCase().trim();
        let filteredHistory = chatHistory;

        if (query) {
          filteredHistory = chatHistory.filter(item =>
            (item.title && item.title.toLowerCase().includes(query)) ||
            (item.preview && item.preview.toLowerCase().includes(query)) ||
            (item.url && item.url.toLowerCase().includes(query))
          );
        }

        renderHistoryList(filteredHistory);
      });

      // 清空历史记录
      clearBtn.addEventListener("click", async () => {
        if (confirm(t("history_clear_confirm", currentLang))) {
          try {
            await chrome.storage.sync.set({ chatHistory: [] });
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
          chatHistory = chatHistory.filter(item => item.id !== itemId);
          await chrome.storage.sync.set({ chatHistory });
          
          // 重新渲染列表
          const query = searchInput.value.toLowerCase().trim();
          let filteredHistory = chatHistory;
          
          if (query) {
            filteredHistory = chatHistory.filter(item =>
              (item.title && item.title.toLowerCase().includes(query)) ||
              (item.preview && item.preview.toLowerCase().includes(query)) ||
              (item.url && item.url.toLowerCase().includes(query))
            );
          }
          
          renderHistoryList(filteredHistory);
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


