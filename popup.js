// popup.js
import { applyTranslations, getLanguage, t } from './i18n.js';

const analyzeBtn = document.getElementById("analyze-btn");
const statusEl = document.getElementById("status");
const resultEl = document.getElementById("result");
const openOptionsBtn = document.getElementById("open-options");

let currentLang = "zh-CN";

// 使用通用的状态设置函数
const setStatus = (function(text, isError = false) {
  statusEl.textContent = text || "";
  statusEl.style.color = isError ? "#f97373" : "#9ca3af";
});

// 初始化多语言
async function initI18n() {
  currentLang = await getLanguage();
  await applyTranslations();
}

openOptionsBtn?.addEventListener("click", () => {
  if (chrome.runtime.openOptionsPage) {
    chrome.runtime.openOptionsPage();
  } else {
    window.open(chrome.runtime.getURL("options.html"));
  }
});

analyzeBtn?.addEventListener("click", async () => {
  currentLang = await getLanguage();
  setStatus(t("status_reading_page", currentLang));
  resultEl.value = "";

  try {
    // 从 storage 获取配置
    const { apiKey, apiUrl, model } = await chrome.storage.sync.get([
      "apiKey",
      "apiUrl",
      "model",
    ]);

    if (!apiKey || !apiUrl || !model) {
      setStatus(t("status_config_missing", currentLang), true);
      return;
    }

    // 获取当前 tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) {
      setStatus(t("status_no_tab", currentLang), true);
      return;
    }

    // 发送消息给 background，让它调用 content script 抓取内容并请求 LLM
    const response = await chrome.runtime.sendMessage({
      type: "ANALYZE_CURRENT_PAGE",
      tabId: tab.id,
    });

    if (response?.ok) {
      setStatus(t("status_analyze_done", currentLang));
      resultEl.value = response.result || t("status_no_result", currentLang);
    } else {
      setStatus(response?.error || t("status_analyze_fail", currentLang), true);
    }
  } catch (err) {
    console.error(err);
    setStatus(t("status_call_fail", currentLang) + (err?.message || String(err)), true);
  }
});

// 初始化
initI18n();


