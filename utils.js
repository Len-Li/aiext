// utils.js - 共享工具函数

// 通用的状态设置函数
function createStatusSetter(statusElement) {
  return function(text, isError = false) {
    if (statusElement) {
      statusElement.textContent = text || "";
      statusElement.style.color = isError ? "#f97373" : "#9ca3af";
    }
  };
}

// 如果在 content script 中使用，可以直接定义
if (typeof window !== 'undefined') {
  window.createStatusSetter = createStatusSetter;
}

// 如果在 background script 中使用，可以导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { createStatusSetter };
}